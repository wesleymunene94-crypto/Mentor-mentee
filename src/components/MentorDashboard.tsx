import React, { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { LogOut, Settings, Users, User, CheckCircle2, XCircle } from 'lucide-react';

interface ConnectionRequest {
  id: string;
  menteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  compatibilityScore: number;
  menteeProfile?: UserProfile;
}

export default function MentorDashboard() {
  const { profile, logout } = useAuth();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!profile) return;
      try {
        const q = query(
          collection(db, 'connections'), 
          where('mentorId', '==', profile.uid),
          where('status', '==', 'PENDING')
        );
        const querySnapshot = await getDocs(q);
        
        const requestList: ConnectionRequest[] = [];
        for (const document of querySnapshot.docs) {
          const data = document.data() as Omit<ConnectionRequest, 'id' | 'menteeProfile'>;
          
          // Fetch mentee profile
          const menteeDoc = await getDoc(doc(db, 'users', data.menteeId));
          const menteeProfile = menteeDoc.exists() ? menteeDoc.data() as UserProfile : undefined;
          
          requestList.push({
            id: document.id,
            ...data,
            menteeProfile
          });
        }
        
        setRequests(requestList);
      } catch (error) {
        console.error("Error fetching requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [profile]);

  const handleUpdateStatus = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setUpdating(connectionId);
    try {
      await updateDoc(doc(db, 'connections', connectionId), { status });
      setRequests(prev => prev.filter(req => req.id !== connectionId));
    } catch (error) {
      console.error(`Error updating status to ${status}`, error);
      alert("Failed to update request status.");
    } finally {
      setUpdating(null);
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
            Requests
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
            <h2 className="text-2xl font-bold text-neutral-900">Mentorship Requests</h2>
            <p className="text-neutral-500 mt-1">Review and respond to students seeking your guidance.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <Users className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No pending requests</h3>
              <p className="text-neutral-500 mt-1">You're all caught up! Check back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start flex-1">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0">
                      {req.menteeProfile?.name?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-neutral-900">
                          {req.menteeProfile?.name || 'Unknown User'}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {req.compatibilityScore}% Match
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">
                        {req.menteeProfile?.bio || 'No bio provided.'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {req.menteeProfile?.tags?.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                      disabled={updating === req.id}
                      className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                      disabled={updating === req.id}
                      className="flex-1 flex justify-center items-center py-2 px-4 border border-neutral-300 rounded-xl shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
