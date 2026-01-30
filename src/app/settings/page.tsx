
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { updateProfile } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming you have an Input component, otherwise use standard input
import { Label } from '@/components/ui/label'; // Assuming Label component or standard label
import Link from 'next/link';
import { ArrowLeft, User, Save } from 'lucide-react';
import { ProfileForm } from '@/components/profile-form';
import { getUserDocuments } from '@/app/services/actions';
import { ResumeManager } from '@/components/resume-manager';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    // Fetch current profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user documents
    const documents = await getUserDocuments();

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            {profile?.image_url ? (
                                <img src={profile.image_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <User className="w-8 h-8" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                            <p className="text-slate-500">Manage your account information</p>
                        </div>
                    </div>

                    <ProfileForm profile={profile} />
                </div>

                <ResumeManager documents={documents} />
            </div>
        </div>
    );
}
