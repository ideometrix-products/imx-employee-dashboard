import { useState, useEffect, ChangeEvent } from 'react';
import {
  User,
  MapPin,
  Clock,
  Globe,
  Briefcase,
  Award,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Linkedin,
  Github,
  Star,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchProfile, updateMyProfile } from '@/components/Api/PostServices';

interface Experience {
  role: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
}

interface Certification {
  title: string;
  issuer: string;
  year: string;
}

interface ReviewScreenshot {
  imageUrl: string;
  caption: string;
  platform: string;
  file?: File;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

function normalizeSkills(skills: any): string[] {
  if (!skills) return [];
  const result: string[] = [];
  const processItem = (item: any) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(processItem);
      return;
    }
    if (typeof item === 'string') {
      let trimmed = item.trim();
      if (!trimmed) return;
      while ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            parsed.forEach(processItem);
            return;
          } else if (typeof parsed === 'string') {
            trimmed = parsed.trim();
          } else {
            break;
          }
        } catch {
          break;
        }
      }
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1).trim();
      }
      if (trimmed.includes(',')) {
        trimmed.split(',').forEach(sub => processItem(sub));
      } else {
        const cleanVal = trimmed.replace(/^["'\[\]]+|["'\[\]]+$/g, '').trim();
        if (cleanVal) result.push(cleanVal);
      }
    }
  };
  processItem(skills);
  return Array.from(new Set(result));
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Basic info
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [years, setYears] = useState(1);
  const [rate, setRate] = useState(25);
  
  // Status
  const [approvalStatus, setApprovalStatus] = useState<'draft' | 'pending_approval' | 'approved'>('draft');
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState('');

  // Media
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Arrays
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [reviewScreenshots, setReviewScreenshots] = useState<ReviewScreenshot[]>([]);
  
  // Social links
  const [linkdInProfileUrl, setLinkdInProfileUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [upworkProfileUrl, setUpworkProfileUrl] = useState('');
  const [fiverrProfileUrl, setFiverrProfileUrl] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchProfile();
      if (data) {
        setName(data.name || '');
        setDesignation(data.designation || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setTimezone(data.timezone || '');
        setYears(data.years || 1);
        setRate(data.rate || 25);
        setImageUrl(data.imageUrl || '');
        setApprovalStatus(data.approvalStatus || 'draft');
        setIsPublished(Boolean(data.isPublished));
        setSlug(data.slug || '');

        setSkills(normalizeSkills(data.skills));
        setLanguages(Array.isArray(data.languages) ? data.languages : []);
        setExperiences(Array.isArray(data.experience) ? data.experience : []);
        setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
        setReviewScreenshots(Array.isArray(data.reviewScreenshots) ? data.reviewScreenshots : []);

        setLinkdInProfileUrl(data.linkdInProfileUrl || '');
        setGithubUrl(data.githubUrl || '');
        setPortfolioUrl(data.portfolioUrl || '');
        setUpworkProfileUrl(data.upworkProfileUrl || '');
        setFiverrProfileUrl(data.fiverrProfileUrl || '');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.message?.includes('401')) {
        toast.error('Session expired. Please sign in again.');
        localStorage.clear();
        window.location.href = '/signin';
        return;
      }
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const [draggedSkillIdx, setDraggedSkillIdx] = useState<number | null>(null);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const moveSkillLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...skills];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSkills(updated);
  };

  const moveSkillRight = (index: number) => {
    if (index === skills.length - 1) return;
    const updated = [...skills];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSkills(updated);
  };

  const handleSkillDragStart = (index: number) => {
    setDraggedSkillIdx(index);
  };

  const handleSkillDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSkillIdx === null || draggedSkillIdx === index) return;
    const updated = [...skills];
    const item = updated.splice(draggedSkillIdx, 1)[0];
    updated.splice(index, 0, item);
    setSkills(updated);
    setDraggedSkillIdx(index);
  };

  const addLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        role: '',
        company: '',
        startMonth: 'Jan',
        startYear: String(new Date().getFullYear()),
        endMonth: 'Present',
        endYear: '',
        isCurrent: true,
      },
    ]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { title: '', issuer: '', year: String(new Date().getFullYear()) },
    ]);
  };

  const updateCertification = (index: number, field: keyof Certification, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addReviewScreenshot = () => {
    setReviewScreenshots([
      ...reviewScreenshots,
      { imageUrl: '', caption: '', platform: 'Upwork' },
    ]);
  };

  const updateReviewScreenshot = (index: number, field: keyof ReviewScreenshot, value: any) => {
    const updated = [...reviewScreenshots];
    updated[index] = { ...updated[index], [field]: value };
    setReviewScreenshots(updated);
  };

  const handleReviewFileChange = (index: number, file: File) => {
    const updated = [...reviewScreenshots];
    updated[index] = {
      ...updated[index],
      file,
      imageUrl: URL.createObjectURL(file),
    };
    setReviewScreenshots(updated);
  };

  const removeReviewScreenshot = (index: number) => {
    setReviewScreenshots(reviewScreenshots.filter((_, i) => i !== index));
  };

  const handleSave = async (submitForApproval = false) => {
    if (submitForApproval) {
      const missing: string[] = [];

      if (!imageUrl && !imageFile) {
        missing.push('Profile Picture');
      }
      if (!location.trim()) {
        missing.push('Location');
      }
      if (!description.trim() || description.trim().length < 20) {
        missing.push('About & Bio description (min 20 chars)');
      }
      if (!skills || skills.length === 0) {
        missing.push('Skills & Tools');
      }
      if (!languages || languages.length === 0) {
        missing.push('Languages Spoken');
      }
      if (!experiences || experiences.length === 0 || experiences.some((e) => !e.role.trim() || !e.company.trim())) {
        missing.push('Work Experience (role & company)');
      }
      if (!certifications || certifications.length === 0 || certifications.some((c) => !c.title.trim() || !c.issuer.trim())) {
        missing.push('Certifications / Education (title & issuer)');
      }
      if (!linkdInProfileUrl.trim() && !githubUrl.trim() && !portfolioUrl.trim() && !upworkProfileUrl.trim() && !fiverrProfileUrl.trim()) {
        missing.push('At least one profile link (LinkedIn/GitHub/Portfolio/Upwork/Fiverr)');
      }

      if (missing.length > 0) {
        toast.error(`Please complete all required profile fields before submitting for admin approval:\n• ${missing.join('\n• ')}`, {
          duration: 5000,
        });
        return;
      }
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', location);
      formData.append('timezone', timezone);
      formData.append('years', String(years));
      formData.append('rate', String(rate));
      formData.append('linkdInProfileUrl', linkdInProfileUrl);
      formData.append('githubUrl', githubUrl);
      formData.append('portfolioUrl', portfolioUrl);
      formData.append('upworkProfileUrl', upworkProfileUrl);
      formData.append('fiverrProfileUrl', fiverrProfileUrl);

      formData.append('skills', JSON.stringify(skills));
      formData.append('languages', JSON.stringify(languages));
      formData.append('experience', JSON.stringify(experiences));
      formData.append('certifications', JSON.stringify(certifications));
      
      const cleanReviews = reviewScreenshots.map((r) => ({
        imageUrl: r.file ? '' : r.imageUrl,
        caption: r.caption || '',
        platform: r.platform || 'Upwork',
      }));
      formData.append('reviewScreenshots', JSON.stringify(cleanReviews));

      reviewScreenshots.forEach((r, idx) => {
        if (r.file) {
          formData.append(`review_screenshot_${idx}`, r.file);
        }
      });

      if (imageFile) {
        formData.append('imageUrl', imageFile);
      }

      if (submitForApproval) {
        formData.append('submitForApproval', 'true');
      }

      const res = await updateMyProfile(formData);
      toast.success(res.message || 'Profile saved successfully!');
      loadProfile();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        Loading your profile editor...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" /> My Public Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your public talent showcase on ideometrix.com
          </p>
        </div>

        {/* Publish Status Badge */}
        <div className="flex items-center gap-3">
          {isPublished ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Live on Website
            </div>
          ) : approvalStatus === 'pending_approval' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
              <Clock3 className="w-4 h-4 text-amber-600" />
              Pending Admin Approval
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              Draft (Unpublished)
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-6">
        
        {/* Section 1: Photo & Header Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Header Information
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-100 shadow-md flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow border-2 border-white transition-colors">
                <Upload className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                  <input type="text" value={name} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
                  <span className="text-[11px] text-slate-400">Admin managed</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Role / Designation</label>
                  <input type="text" value={designation} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
                  <span className="text-[11px] text-slate-400">Admin managed</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lahore, Pakistan" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Years of Exp</label>
                  <input type="number" min="0" max="40" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Hourly Rate ($/hr)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">$</span>
                    <input type="number" min="1" max="500" value={rate} onChange={(e) => setRate(Number(e.target.value))} placeholder="25" className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bio / About */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> About & Bio
            </h2>
            <span className={`text-xs font-semibold ${description.length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
              {description.length} / 500 chars
            </span>
          </div>

          <textarea
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a concise overview of your technical background, specialties, and key accomplishments..."
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        {/* Section 3: Skills & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Skills */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" /> Skills &amp; Tools
                </span>
                <span className="text-xs font-normal text-slate-400">
                  {skills.length} skills
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-2">
                Drag any skill tag to reorder. The ⭐ <strong>first 3 skills</strong> will appear on your public talent card.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add skill (e.g. React, Next.js, Node)"
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addSkill}
                style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
                className="px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  draggable
                  onDragStart={() => handleSkillDragStart(idx)}
                  onDragOver={(e) => handleSkillDragOver(e, idx)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-grab active:cursor-grabbing border transition-all ${
                    idx < 3
                      ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {idx < 3 && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="hover:text-rose-600 ml-1 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" /> Languages Spoken
              </span>
              <span className="text-xs font-normal text-slate-400">
                {languages.length} languages
              </span>
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={languageInput}
                onChange={(e) => setLanguageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                placeholder="Add language (e.g. English, Urdu)"
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addLanguage}
                style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
                className="px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                Add Language
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {languages.map((lang, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(idx)} className="hover:text-rose-600 ml-0.5">×</button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Section 4: Experience Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" /> Work Experience Timeline
            </h2>
            <button type="button" onClick={addExperience} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Role
            </button>
          </div>

          {experiences.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No work experience added yet.</p>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative">
                  <button type="button" onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Role / Job Title</label>
                      <input type="text" value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} placeholder="e.g. Senior Full Stack Engineer" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Company / Organization</label>
                      <input type="text" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} placeholder="e.g. Acme Tech Corp" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Start:</span>
                      <select value={exp.startMonth} onChange={(e) => updateExperience(idx, 'startMonth', e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={exp.startYear} onChange={(e) => updateExperience(idx, 'startYear', e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    {!exp.isCurrent && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>End:</span>
                        <select value={exp.endMonth} onChange={(e) => updateExperience(idx, 'endMonth', e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select value={exp.endYear} onChange={(e) => updateExperience(idx, 'endYear', e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer ml-auto">
                      <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExperience(idx, 'isCurrent', e.target.checked)} className="accent-indigo-600" />
                      Current Role
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Certifications & Education */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Certifications & Education
            </h2>
            <button type="button" onClick={addCertification} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {certifications.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No certifications added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((cert, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 relative">
                  <button type="button" onClick={() => removeCertification(idx)} className="absolute top-3 right-3 text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <input type="text" value={cert.title} onChange={(e) => updateCertification(idx, 'title', e.target.value)} placeholder="Certification / Degree Title" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500" />
                  <div className="flex gap-2">
                    <input type="text" value={cert.issuer} onChange={(e) => updateCertification(idx, 'issuer', e.target.value)} placeholder="Issuing Body / University" className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                    <input type="text" value={cert.year} onChange={(e) => updateCertification(idx, 'year', e.target.value)} placeholder="Year" className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Upwork / Fiverr Review Proof Screenshots */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" /> Upwork &amp; Fiverr Review Proof Screenshots
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload proof screenshots of 5-star ratings or client reviews from freelance platforms to display on your public profile.
              </p>
            </div>
            <button
              type="button"
              onClick={addReviewScreenshot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Review Screenshot
            </button>
          </div>

          {reviewScreenshots.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-600 mb-1">No review screenshots added yet</p>
              <p className="text-xs text-slate-400 mb-3">Add screenshot proofs of your Upwork, Fiverr, or client reviews to boost credibility.</p>
              <button
                type="button"
                onClick={addReviewScreenshot}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Review Screenshot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reviewScreenshots.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3 relative flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => removeReviewScreenshot(idx)}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors z-10 cursor-pointer"
                    title="Remove Screenshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-3">
                    {/* Platform Selector */}
                    <div className="flex items-center gap-2 pr-8">
                      <label className="text-xs font-bold text-slate-500 uppercase shrink-0">Platform:</label>
                      <select
                        value={rev.platform || 'Upwork'}
                        onChange={(e) => updateReviewScreenshot(idx, 'platform', e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Upwork">Upwork</option>
                        <option value="Fiverr">Fiverr</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Direct Client">Direct Client</option>
                      </select>
                    </div>

                    {/* Direct Image Upload / Preview Box */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Screenshot Proof Image
                      </label>
                      {rev.imageUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group h-44 flex items-center justify-center">
                          <img
                            src={rev.imageUrl}
                            alt="Review Proof Screenshot"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold cursor-pointer transition-transform hover:scale-105 shadow flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" /> Replace Screenshot
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleReviewFileChange(idx, e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl bg-white hover:bg-indigo-50/40 transition-all cursor-pointer p-4 text-center group">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2 transition-colors">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                            Click to upload review screenshot
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 10MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleReviewFileChange(idx, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Short Caption */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Caption / Project Summary
                      </label>
                      <input
                        type="text"
                        value={rev.caption || ''}
                        onChange={(e) => updateReviewScreenshot(idx, 'caption', e.target.value)}
                        placeholder="e.g. 5-Star review on Full-Stack Web Development project"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 7: Social & Professional Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" /> Social &amp; Professional Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">LinkedIn Profile URL</label>
              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="url" value={linkdInProfileUrl} onChange={(e) => setLinkdInProfileUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">GitHub Profile URL</label>
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Portfolio Website URL</label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://myportfolio.com or https://behance.net/..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Upwork Profile URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="url" value={upworkProfileUrl} onChange={(e) => setUpworkProfileUrl(e.target.value)} placeholder="https://upwork.com/freelancers/..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Fiverr Profile URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="url" value={fiverrProfileUrl} onChange={(e) => setFiverrProfileUrl(e.target.value)} placeholder="https://fiverr.com/..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky bottom-4 z-10">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false)}
            className="w-full sm:w-auto px-6 py-3 border border-slate-300 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true)}
            style={{ backgroundColor: '#4F46E5', color: '#FFFFFF' }}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {saving ? 'Submitting...' : 'Submit for Admin Approval'}
          </button>
        </div>

      </div>
    </div>
  );
}
