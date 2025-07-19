import React from 'react';

const ProfilePage = () => {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-500">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">User Name</h2>
            <p className="text-gray-600">user@example.com</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <p className="text-gray-600">Hello! I'm a user of Socket-Talk.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="text-gray-600">July 2023</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
