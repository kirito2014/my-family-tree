'use client';

import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  family?: {
    name: string;
  };
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  loading,
  onMarkAsRead,
  onMarkAllAsRead
}: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-2xl shadow-lg z-50 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">通知中心</h3>
          {onMarkAllAsRead && notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
              title="全部已读"
            >
              ✓ 一键已读
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10">
              <Bell size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${notification.isRead ? 'bg-white border-gray-200' : 'bg-green-50 border-green-200'}`}
                  onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
                    <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{notification.content}</p>
                  {notification.family && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        家族: {notification.family.name}
                      </span>
                    </div>
                  )}
                  {!notification.isRead && (
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">未读</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full h-10 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
