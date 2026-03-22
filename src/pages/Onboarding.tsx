import React, { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { Card, Button } from '../components/UI';
import { Home, Users, MapPin, DollarSign, ArrowRight, Check } from 'lucide-react';

export default function Onboarding() {
  const { setState } = useAppState();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    householdName: '',
    currency: 'PHP',
    country: 'Philippines',
    members: ['']
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Finalize onboarding
      const householdId = `HOUSE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const memberNames = formData.members.filter(m => m);
      const firstMemberName = memberNames[0] || 'Admin';
      const firstMemberId = `mem-${Math.random().toString(36).substr(2, 9)}`;

      setState(prev => ({
        ...prev,
        household: {
          id: householdId,
          name: formData.householdName,
          currencyCode: formData.currency,
          country: formData.country
        },
        isAuthenticated: true,
        user: {
          id: firstMemberId,
          displayName: firstMemberName,
          role: 'Admin',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstMemberName}`
        },
        masterData: [
          ...prev.masterData,
          {
            id: firstMemberId,
            name: firstMemberName,
            type: 'HouseholdMember' as const
          },
          ...memberNames.slice(1).map(m => ({
            id: `mem-${Math.random().toString(36).substr(2, 9)}`,
            name: m,
            type: 'HouseholdMember' as const
          }))
        ]
      }));
    }
  };

  const addMember = () => {
    setFormData(prev => ({ ...prev, members: [...prev.members, ''] }));
  };

  const updateMember = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step ? 'w-8 bg-[#00695C]' : s < step ? 'w-4 bg-[#00695C]/40' : 'w-4 bg-gray-200'
              }`} 
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-[#0A192F]">Welcome to Homiq</h1>
              <p className="text-gray-400">Let's set up your household profile.</p>
            </div>
            <Card className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Household Name</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="text" 
                      placeholder="e.g. The Smith Residence"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00695C]/10 text-sm font-medium"
                      value={formData.householdName}
                      onChange={(e) => setFormData({ ...formData, householdName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Currency</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <select 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00695C]/10 text-sm font-medium appearance-none"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="PHP">PHP (₱)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                      <input 
                        type="text" 
                        placeholder="Philippines"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00695C]/10 text-sm font-medium"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full py-4" onClick={handleNext} disabled={!formData.householdName}>
                Continue
              </Button>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-[#0A192F]">Who's at home?</h1>
              <p className="text-gray-400">Add members to assign tasks and track roles.</p>
            </div>
            <Card className="p-8 space-y-6">
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {formData.members.map((member, index) => (
                  <div key={index} className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      type="text" 
                      placeholder={`Member ${index + 1} Name`}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#00695C]/10 text-sm font-medium"
                      value={member}
                      onChange={(e) => updateMember(index, e.target.value)}
                    />
                  </div>
                ))}
                <button 
                  onClick={addMember}
                  className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  + Add Another Member
                </button>
              </div>
              <Button className="w-full py-4" onClick={handleNext} disabled={formData.members.filter(m => m).length === 0}>
                Next Step
              </Button>
            </Card>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-900/20">
                <Check size={40} strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-black text-[#0A192F]">All set!</h1>
              <p className="text-gray-400 leading-relaxed px-8">
                Your household <span className="text-[#0A192F] font-bold">"{formData.householdName}"</span> is ready. 
                You can now start managing inventory, groceries, and tasks.
              </p>
            </div>
            <Card className="p-8 bg-[#0A192F] text-white border-none shadow-2xl shadow-navy-900/40">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Household ID</p>
                  <p className="text-2xl font-mono font-bold tracking-wider">HOUSE-XXXX</p>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    Share this ID with other members so they can join your household.
                  </p>
                </div>
                <Button variant="secondary" className="w-full py-4 text-lg" onClick={handleNext} icon={ArrowRight}>
                  Get Started
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
