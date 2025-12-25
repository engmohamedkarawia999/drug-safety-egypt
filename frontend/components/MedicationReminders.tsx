import { Bell, X, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Drug } from '@/types';

interface MedicationRemindersProps {
    drugs: Drug[];
    isRTL: boolean;
}

interface Reminder {
    drugName: string;
    time: string;
    enabled: boolean;
}

export default function MedicationReminders({ drugs, isRTL }: MedicationRemindersProps) {
    const [show, setShow] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [reminders, setReminders] = useState<Reminder[]>([]);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }

        // Load saved reminders
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('medication_reminders');
            if (saved) {
                setReminders(JSON.parse(saved));
            }
        }
    }, []);

    const requestPermission = async () => {
        if ('Notification' in window) {
            const result = await Notification.requestPermission();
            setPermission(result);
        }
    };

    const addReminder = (drugName: string, time: string) => {
        const newReminder = { drugName, time, enabled: true };
        const updated = [...reminders, newReminder];
        setReminders(updated);

        if (typeof window !== 'undefined') {
            localStorage.setItem('medication_reminders', JSON.stringify(updated));
        }

        // Schedule notification
        scheduleNotification(drugName, time);
    };

    const removeReminder = (index: number) => {
        const updated = reminders.filter((_, i) => i !== index);
        setReminders(updated);

        if (typeof window !== 'undefined') {
            localStorage.setItem('medication_reminders', JSON.stringify(updated));
        }
    };

    const scheduleNotification = (drugName: string, time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (scheduledTime < now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntil = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            if (permission === 'granted') {
                new Notification(isRTL ? '🔔 تذكير دواء' : '🔔 Medication Reminder', {
                    body: isRTL ? `حان وقت تناول: ${drugName}` : `Time to take: ${drugName}`,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico'
                });
            }
        }, timeUntil);
    };

    if (drugs.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setShow(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm text-sm font-medium"
                title={isRTL ? "تذكيرات الأدوية" : "Medication Reminders"}
            >
                <Bell className="h-4 w-4" />
                {isRTL ? "التذكيرات" : "Reminders"}
            </button>

            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShow(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Bell className="h-6 w-6 text-purple-600" />
                            {isRTL ? "تذكيرات الأدوية" : "Medication Reminders"}
                        </h2>

                        {permission !== 'granted' && (
                            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                                    {isRTL ? "يجب السماح بالإشعارات لتفعيل التذكيرات" : "Please allow notifications to enable reminders"}
                                </p>
                                <button
                                    onClick={requestPermission}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                                >
                                    {isRTL ? "السماح بالإشعارات" : "Allow Notifications"}
                                </button>
                            </div>
                        )}

                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {reminders.map((reminder, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        <div>
                                            <div className="font-semibold text-gray-800 dark:text-gray-100">{reminder.drugName}</div>
                                            <div className="text-sm text-gray-500">{reminder.time}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeReminder(index)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? "إضافة تذكير جديد" : "Add New Reminder"}
                            </h3>
                            {drugs.map((drug) => (
                                <div key={drug.rxcui} className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{drug.name}</span>
                                    <input
                                        type="time"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addReminder(drug.name, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
