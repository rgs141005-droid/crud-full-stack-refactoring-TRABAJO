/**
*    File        : frontend/js/controllers/subjectsController.js
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

import { subjectsAPI } from '../api/subjectsAPI.js';

let debounceTimer = null;
let currentEditingId = '';
let originalName = '';

document.addEventListener('DOMContentLoaded', () => 
{
    loadSubjects();
    setupSubjectFormHandler();
    setupCancelHandler();
    setupNameValidation();
});

// Modal helper: muestra un mensaje personalizado y centrado
function showMessage(title, message)
{
    const modal = document.getElementById('messageModal');
    if (!modal) {
        alert(message);
        return;
    }

    const titleEl = document.getElementById('modalTitle');
    const msgEl = document.getElementById('modalMessage');
    const closeBtn = document.getElementById('modalClose');

    titleEl.textContent = title || 'Mensaje';
    msgEl.textContent = message || '';

    const hide = () => modal.style.display = 'none';

    // botón cerrar (en la cabecera) a la derecha
    if (closeBtn) closeBtn.onclick = hide;

    // cerrar al hacer click fuera del contenido
    modal.onclick = function(evt) { if (evt.target === modal) hide(); };

    modal.style.display = 'block';
}

function setupSubjectFormHandler() 
{
  const form = document.getElementById('subjectForm');
  form.addEventListener('submit', async e => 
  {
        e.preventDefault();
        const subject = 
        {
            id: document.getElementById('subjectId').value.trim(),
            name: document.getElementById('name').value.trim()
        };

        const localErr = validateLocal(subject.name);
        if (localErr) 
        {
            setError(localErr);
            return;
        }

        // Comprobación rápida de unicidad (si no es el mismo registro en edición)
        const available = await isNameAvailable(subject.name, subject.id);
        if (!available) 
        {
            setError('Ya existe una materia con ese nombre');
            return;
        }

        try 
        {
            if (subject.id) 
            {
                // Al editar, validar que no exista otra materia con el mismo nombre
                const existingSubjects = await subjectsAPI.fetchAll();
                const exists = existingSubjects.some(s => s.name && s.name.toLowerCase() === subject.name.toLowerCase() && String(s.id) !== String(subject.id));
                if (exists)
                {
                    showMessage('Error', 'Esta materia ya existe');
                    return;
                }

                await subjectsAPI.update(subject);
            }
            else
            {
                // Validación frontend: evitar crear materia con nombre ya existente (insensible a mayúsculas)
                const existingSubjects = await subjectsAPI.fetchAll();
                const exists = existingSubjects.some(s => s.name && s.name.toLowerCase() === subject.name.toLowerCase());
                if (exists)
                {
                    showMessage('Error', 'La materia que quiere crear ya existe');
                    return;
                }

                await subjectsAPI.create(subject);
            }
            
            form.reset();
            document.getElementById('subjectId').value = '';
            loadSubjects();
        }
        catch (err)
        {
            console.error(err.message);
            showMessage('Error', err.message || 'Ocurrió un error');
        }
  });
}

function setupCancelHandler()
{
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', () => 
    {
        document.getElementById('subjectId').value = '';
    });
}

async function loadSubjects()
{
    try
    {
        const subjects = await subjectsAPI.fetchAll();
        renderSubjectTable(subjects);
    }
    catch (err)
    {
        console.error('Error cargando materias:', err.message);
    }
}

function renderSubjectTable(subjects)
{
    const tbody = document.getElementById('subjectTableBody');
    tbody.replaceChildren();

    subjects.forEach(subject =>
    {
        const tr = document.createElement('tr');

        tr.appendChild(createCell(subject.name));
        tr.appendChild(createSubjectActionsCell(subject));

        tbody.appendChild(tr);
    });
}

function createCell(text)
{
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

function createSubjectActionsCell(subject)
{
    const td = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'w3-button w3-blue w3-small';
    editBtn.addEventListener('click', () => 
    {
        document.getElementById('subjectId').value = subject.id;
        document.getElementById('name').value = subject.name;
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Borrar';
    deleteBtn.className = 'w3-button w3-red w3-small w3-margin-left';
    deleteBtn.addEventListener('click', () => confirmDeleteSubject(subject.id));

    td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    return td;
}

async function confirmDeleteSubject(id)
{
    if (!confirm('¿Seguro que deseas borrar esta materia?')) return;

    try
    {
        await subjectsAPI.remove(id);
        loadSubjects();
    }
    catch (err)
    {
        console.error('Error al borrar materia:', err.message);
    }
}

//

function setupNameValidation() {
    const nameInput = document.getElementById('name');
    nameInput.addEventListener('input', onNameInput);
    // crear elemento para mostrar error si no existe
    if (!document.getElementById('nameError')) {
        const err = document.createElement('span');
        err.id = 'nameError';
        err.style.color = 'red';
        nameInput.parentNode.appendChild(err);
    }
    clearError();
}

function normalizeName(s) {
    return (s || '').trim();
}

function validateLocal(name) {
    if (!name) return 'El nombre es obligatorio';
    if (name.length < 3) return 'Mínimo 3 caracteres';
    if (name.length > 100) return 'Máximo 100 caracteres';
    return '';
}

function setError(msg) {
    const errSpan = document.getElementById('nameError');
    if (errSpan) errSpan.textContent = msg || '';

    const submitBtn = document.querySelector('#subjectForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = !!msg;
}

function clearError() {
    setError('');
}

async function onNameInput(e) {
    const raw = e.target.value;
    const name = normalizeName(raw);
    const localErr = validateLocal(name);
    if (localErr) {
        setError(localErr);
        return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        setError('Viendo si se puede');
        const available = await isNameAvailable(name, currentEditingId);
        if (!available) {
            setError('Ese nombre ya esta siendo usado ❌, busca otro');
        } else {
            clearError();
        }
    }, 350);
}


async function isNameAvailable(name, editingId = '') {
    try {
        const all = await subjectsAPI.fetchAll();
        const lower = name.toLowerCase();
        return !all.some(s => s.name && s.name.toLowerCase() === lower && s.id !== editingId);
    } catch (err) {

        console.error('Error verificando nombre:', err);
        return false;
    }
}