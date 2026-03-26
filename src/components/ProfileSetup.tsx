import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

const AVAILABLE_TAGS = [
  'Coding', 'Public Speaking', 'Marketing', 'Leadership',
  'Design', 'Economics', 'Data Science', 'Writing',
  'Event Planning', 'Support', 'Other'
];

export default function ProfileSetup() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [bio, setBio] = useState(profile?.bio || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(profile?.tags || []);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (selectedTags.length === 0) {
      alert('Please select at least one interest/skill.');
      return;
    }
    
    setSaving(true);
    try {
      await updateProfile({
        bio,
        tags: selectedTags,
        isProfileComplete: true
      });
      navigate(profile?.role === 'mentor' ? '/mentor' : '/mentee');
    } catch (error) {
      console.error('Failed to save profile', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-neutral-100">
          <div className="px-6 py-8 sm:p-10">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Complete Your Profile</h2>
            <p className="text-neutral-500 mb-8">
              Tell us a bit about yourself to help us find the best {profile?.role === 'mentor' ? 'mentees' : 'mentors'} for you.
            </p>

            <div className="space-y-8">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-2">
                  Personal Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="w-full p-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Share a little about your background, goals, and what you're looking for..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-sm font-medium text-neutral-700">
                    Interests & Skills
                  </label>
                  <span className="text-xs text-neutral-400">Select multiple</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {selectedTags.includes(tag) && <Check className="w-4 h-4 mr-1.5" />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile & Continue'}
                  {!saving && <ChevronRight className="ml-2 w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
