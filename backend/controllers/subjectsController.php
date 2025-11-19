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

    if (isset($input['studentCount'])) 
    {
        // Obtener cantidad de estudiantes para una materia
        $count = getStudentCountBySubject($conn, $input['id']);
        echo json_encode(["id" => $input['id'], "studentCount" => $count]);
    }
    elseif (isset($input['id'])) 
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

$existing = getSubjectByName($conn, $input['name']);
    if ($existing) {
        http_response_code(409); // Conflict
        echo json_encode(["error" => "Ya existe una materia con ese nombre"]);
        return;
    }
   else {

    $result = createSubject($conn, $input['name']);
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

    $result = updateSubject($conn, $input['id'], $input['name']);
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
   // mofificacion  
   // $count = countStudentsBySubject($conn, $input['id']);//cuenta cuantos alumnos hay en la materia 
    
    // Verificar si la materia tiene estudiantes asignados
    $studentCount = countStudentsBySubject($conn, $input['id']);
    if ($studentCount > 0) {
        http_response_code(409); // Conflict
        echo json_encode(["error" => "No se puede eliminar la materia porque tiene " . $studentCount . " estudiante(s) asignado(s)"]);
        return;
    }
    
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