<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $empIds = $this->companyEmployeeIds();
        $q = Document::whereIn('employee_id', $empIds)->with('employee:id,first_name,last_name,department');

        if ($request->employee_id) $q->where('employee_id', $request->employee_id);
        if ($request->type && $request->type !== 'all') $q->where('type', $request->type);
        if ($request->search) $q->where('title', 'like', "%{$request->search}%");

        return response()->json(['success' => true, 'data' => $q->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15))]);
    }

    public function store(Request $request)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado para subir documentos.'], 403);
        }

        $v = Validator::make($request->all(), [
            'employee_id' => 'required|integer|exists:employees,id',
            'title'       => 'required|string|max:255',
            'type'        => 'required|in:contract,certificate,id_document,payroll,other',
            'file'        => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
            'expiry_date' => 'nullable|date',
        ]);

        if ($v->fails()) return response()->json(['success' => false, 'message' => 'Error de validación', 'errors' => $v->errors()], 422);

        $emp = Employee::forUser($this->companyAdminId())->find($request->employee_id);
        if (!$emp) return response()->json(['success' => false, 'message' => 'Empleado no autorizado'], 403);

        $file     = $request->file('file');
        $fileName = Str::slug($request->title) . '_' . time() . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs("documents/{$request->employee_id}", $fileName, 'local');

        $doc = Document::create([
            'employee_id' => $request->employee_id,
            'user_id'     => Auth::id(),
            'title'       => $request->title,
            'type'        => $request->type,
            'file_path'   => $filePath,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
            'expiry_date' => $request->expiry_date,
            'notes'       => $request->notes,
        ]);

        return response()->json(['success' => true, 'message' => 'Documento subido', 'data' => $doc->load('employee:id,first_name,last_name')], 201);
    }

    public function show($id)
    {
        $empIds = $this->companyEmployeeIds();
        $doc = Document::whereIn('employee_id', $empIds)->with('employee')->find($id);
        if (!$doc) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        return response()->json(['success' => true, 'data' => $doc]);
    }

    public function update(Request $request, $id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $doc = Document::whereIn('employee_id', $empIds)->find($id);
        if (!$doc) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $doc->update($request->only(['title', 'type', 'expiry_date', 'notes']));
        return response()->json(['success' => true, 'message' => 'Documento actualizado', 'data' => $doc->fresh()]);
    }

    public function destroy($id)
    {
        if ($this->isEmployee()) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $empIds = $this->companyEmployeeIds();
        $doc = Document::whereIn('employee_id', $empIds)->find($id);
        if (!$doc) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        if ($doc->file_path && Storage::disk('local')->exists($doc->file_path)) {
            Storage::disk('local')->delete($doc->file_path);
        }
        $doc->delete();
        return response()->json(['success' => true, 'message' => 'Documento eliminado']);
    }
}
