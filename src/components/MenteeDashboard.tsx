import React, { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '../AuthContext';
import { db } from '../firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Settings, Users, User, CheckCircle2, X } from 'lucide-react';

interface MentorMatch extends UserProfile {
  compatibilityScore: number;
}

export default function MenteeDashboard() {
  const { profile, logout } = useAuth();
  const [mentors, setMentors] = useState<MentorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<MentorMatch | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchMentors = async () => {
      if (!profile) return;
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'mentor'));
        const querySnapshot = await getDocs(q);
        
        const mentorList: MentorMatch[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          if (data.isProfileComplete) {
            // Calculate compatibility score
            let score = 0;
            const menteeTags = profile.tags || [];
            const mentorTags = data.tags || [];
            
            if (menteeTags.length > 0 && mentorTags.length > 0) {
              const commonTags = menteeTags.filter(tag => mentorTags.includes(tag));
              score = Math.round((commonTags.length / menteeTags.length) * 100);
            }
            
            mentorList.push({ ...data, compatibilityScore: score });
          }
        });
        
        // Sort by highest score
        mentorList.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        setMentors(mentorList);
      } catch (error) {
        console.error("Error fetching mentors", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [profile]);

  const handleRequestMentorship = async () => {
    if (!selectedMentor || !profile) return;
    setRequesting(true);
    try {
      await addDoc(collection(db, 'connections'), {
        menteeId: profile.uid,
        mentorId: selectedMentor.uid,
        status: 'PENDING',
        compatibilityScore: selectedMentor.compatibilityScore,
        createdAt: serverTimestamp()
      });
      setSuccessMsg(`Mentorship request sent to ${selectedMentor.name}!`);
      setSelectedMentor(null);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error("Error sending request", error);
      alert("Failed to send request.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-100">
          <h1 className="text-xl font-bold text-blue-600 flex items-center">
            <Users className="mr-2 h-6 w-6" />
            Mentor Match
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl bg-blue-50 text-blue-700">
            <Users className="mr-3 h-5 w-5" />
            Matches
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-neutral-600 hover:bg-neutral-50">
            <User className="mr-3 h-5 w-5" />
            My Profile
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-neutral-600 hover:bg-neutral-50">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Mentorship Matching Dashboard</h2>
            <p className="text-neutral-500 mt-1">Find your perfect mentor based on your interests.</p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center text-green-800">
              <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
              {successMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <Users className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No mentors found</h3>
              <p className="text-neutral-500 mt-1">Check back later for new mentors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor, idx) => (
                <div key={mentor.uid} className={`bg-white rounded-2xl border ${idx === 0 ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'border-neutral-200 shadow-sm'} overflow-hidden transition-all hover:shadow-md`}>
                  {idx === 0 && (
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Top Match</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center text-xl font-bold text-neutral-600">
                        {mentor.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {mentor.compatibilityScore}% Match
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900">{mentor.name}</h3>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2 h-10">{mentor.bio || 'No bio provided.'}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-1.5 h-14 overflow-hidden">
                      {mentor.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600">
                          {tag}
                        </span>
                      ))}
                      {(mentor.tags?.length || 0) > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-50 text-neutral-500">
                          +{(mentor.tags?.length || 0) - 3} more
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="mt-6 w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Request Mentorship
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-900 opacity-75" onClick={() => !requesting && setSelectedMentor(null)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-neutral-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-bold text-neutral-900">
                        Confirm Request
                      </h3>
                      <button onClick={() => setSelectedMentor(null)} className="text-neutral-400 hover:text-neutral-500">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500">
                        Are you sure you want to send a mentorship request to <span className="font-bold text-neutral-900">{selectedMentor.name}</span>?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={requesting}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={handleRequestMentorship}
                >
                  {requesting ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  type="button"
                  disabled={requesting}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedMentor(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
