'use client';

import { updateProfile } from '@/app/settings/actions';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ProfileForm({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const result = await updateProfile(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Profile updated successfully');
            }
        } catch (e) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</label>
                    <input
                        id="firstName"
                        name="firstName"
                        defaultValue={profile?.first_name || ''}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="e.g. John"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name</label>
                    <input
                        id="lastName"
                        name="lastName"
                        defaultValue={profile?.last_name || ''}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="e.g. Doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                    disabled
                    value={profile?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
