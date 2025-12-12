import React from 'react';
import { DoorOpen, User } from 'lucide-react';
// import userAvatar from '../assets/imx-03.jpg';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from './Api/PostServices';

interface Props {
  onClose: () => void;
}

const AvatarMenu: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<{ name?: string; imageUrl?: string }>({});
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  const handleLogout = () => {
    navigate('/');
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 bg-white shadow-xl rounded-lg border z-50 w-44">
      <div className="flex flex-col items-center p-4">
        {!imageLoaded && (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-7 h-7 text-gray-400" />
          </div>
        )}
        <img
          src={profile.imageUrl || profile.name}
          alt="User Avatar"
          className={`w-12 h-12 rounded-full object-cover mb-2 ${imageLoaded ? '' : 'hidden'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
        <span className="font-medium text-gray-700 mb-2">{profile.name || 'User'}</span>
      </div>
      <div
        className="flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        onClick={handleLogout}
      >
        <span className="font-medium text-gray-700">Logout</span>
        <DoorOpen size={18} className="ml-auto text-red-500" />
      </div>
    </div>
  );
};

export default AvatarMenu;