<?php
/**
*    File        : backend/controllers/studentsController.php
*    Project     : CRUD PHP
*    Author      : Tecnologías Informáticas B - Facultad de Ingeniería - UNMdP
*    License     : http://www.gnu.org/licenses/gpl.txt  GNU GPL 3.0
*    Date        : Mayo 2025
*    Status      : Prototype
*    Iteration   : 3.0 ( prototype )
*/

require_once("./repositories/students.php");

function handleGet($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (isset($input['id'])) 
    {
        $student = getStudentById($conn, $input['id']);
        echo json_encode($student);
    } 
    else
    {
        $students = getAllStudents($conn);
        echo json_encode($students);
    }
}

function handlePost($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);

    $result = createStudent($conn, $input['fullname'], $input['email'], $input['age']);
    //agregado
    if (isset($result['error']) && $result['error'] === 'email_exists') {
        http_response_code(400);
        echo json_encode(["error" => "El correo ya existe"]);
        return;
    }

    if ($result['inserted'] > 0) 
    {
        echo json_encode(["message" => "Estudiante agregado correctamente"]);
    } 
    else 
    {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo agregar"]);
    }
}

function handlePut($conn) 
{
    $input = json_decode(file_get_contents("php://input"), true);

    $result = updateStudent($conn, $input['id'], $input['fullname'], $input['email'], $input['age']);
  //agregado
    if (isset($result['error']) && $result['error'] === 'email_exists') {
        http_response_code(400);
        echo json_encode(["error" => "El correo ya existe"]);
        return;
    }

    if ($result['updated'] > 0) 
    {
        echo json_encode(["message" => "Actualizado correctamente"]);
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

    // Validar que viene el id
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Falta el id del estudiante"]);
        return;
    }

    $id = intval($input['id']);

    // Verificar si el estudiante tiene asignaciones ANTES de borrar
    require_once __DIR__ . '/../repositories/studentsSubjects.php';
    $assignments = getSubjectsByStudent($conn, $id);

    if (!empty($assignments)) {
        http_response_code(400);
        echo json_encode([
            "error" => "No se puede borrar el estudiante: tiene asignaciones",
            "assignments" => $assignments
        ]);
        return;
    }

    // Si no tiene asignaciones, proceder a borrar
    $result = deleteStudent($conn, $id);
    if ($result['deleted'] > 0) 
    {
        echo json_encode(["message" => "Eliminado correctamente"]);
    } 
    else 
    {
        http_response_code(500);
        echo json_encode(["error" => "No se pudo eliminar"]);
    }
}
?>
