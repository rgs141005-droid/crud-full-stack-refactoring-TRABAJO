<?php
/**
*    File        : backend/controllers/subjectsController.php
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

require_once("./repositories/subjects.php");

function handleGet($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['id'])) 
    {
        $subject = getSubjectById($conn, $input['id']);
        echo json_encode($subject);
    } 
    else 
    {
        $subjects = getAllSubjects($conn);
        echo json_encode($subjects);
    }
}

function handlePost($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);

    $name = isset($input['name']) ? trim($input['name']) : '';
    if ($name === '')
    {
        http_response_code(400);
        echo json_encode(["error" => "El nombre de la materia es requerido"]);
        return;
    }

    // Validar existencia previa (insensible a mayúsculas)
    $existing = getSubjectByName($conn, $name);
    if ($existing)
    {
        http_response_code(400);
        echo json_encode(["error" => "La materia que quiere crear ya existe"]);
        return;
    }

    $result = createSubject($conn, $name);
    if ($result['inserted'] > 0) 
    {
        echo json_encode(["message" => "Materia creada correctamente"]);
    } 
    else 
    {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo crear"]);
    }
    }
}

function handlePut($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);

    $id = isset($input['id']) ? $input['id'] : null;
    $name = isset($input['name']) ? trim($input['name']) : '';

    if (!$id)
    {
        http_response_code(400);
        echo json_encode(["error" => "ID de materia requerido"]);
        return;
    }

    if ($name === '')
    {
        http_response_code(400);
        echo json_encode(["error" => "El nombre de la materia es requerido"]);
        return;
    }

    // Validar existencia de otra materia con el mismo nombre
    $existing = getSubjectByName($conn, $name);
    if ($existing && intval($existing['id']) !== intval($id))
    {
        http_response_code(400);
        echo json_encode(["error" => "Esta materia ya existe"]);
        return;
    }

    $result = updateSubject($conn, $id, $name);
    if ($result['updated'] > 0) 
    {
        echo json_encode(["message" => "Materia actualizada correctamente"]);
    } 
    else 
    {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo actualizar"]);
    }
}

function handleDelete($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);
    
    $result = deleteSubject($conn, $input['id']);
    if ($result['deleted'] > 0) 
    {
        echo json_encode(["message" => "Materia eliminada correctamente"]);
    } 
    else 
    {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo eliminar"]);
    }
}
?>