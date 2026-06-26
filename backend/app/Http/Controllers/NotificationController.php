<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $notifs = Notification::forUser(Auth::id())->orderBy('created_at','desc')->paginate(20);
        return response()->json(['success' => true, 'data' => $notifs, 'unread_count' => Notification::forUser(Auth::id())->unread()->count()]);
    }

    public function markRead($id)
    {
        $n = Notification::forUser(Auth::id())->find($id);
        if (!$n) return response()->json(['success' => false, 'message' => 'No encontrada'], 404);
        $n->update(['is_read' => true]);
        return response()->json(['success' => true, 'message' => 'Marcada como leída']);
    }

    public function markAllRead()
    {
        Notification::forUser(Auth::id())->unread()->update(['is_read' => true]);
        return response()->json(['success' => true, 'message' => 'Todas marcadas como leídas']);
    }

    public function destroy($id)
    {
        $n = Notification::forUser(Auth::id())->find($id);
        if ($n) $n->delete();
        return response()->json(['success' => true, 'message' => 'Eliminada']);
    }
}
