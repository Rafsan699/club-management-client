import React from 'react';

const DepartmentsSection = ({ departments = [] }) => {
  const defaultDepts = [
    { name: 'Computer Science & Eng.', logo: 'https://cdn-icons-png.flaticon.com/512/201/201623.png' },
    { name: 'Electrical & Electronic Eng.', logo: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png' },
    { name: 'Business Administration', logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { name: 'Civil Engineering', logo: 'https://cdn-icons-png.flaticon.com/512/1048/1048927.png' },
    { name: 'Textile Engineering', logo: 'https://cdn-icons-png.flaticon.com/512/3344/3344322.png' },
    { name: 'Law & Justice', logo: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png' },
    { name: 'English Literature', logo: 'https://cdn-icons-png.flaticon.com/512/2432/2432572.png' }
  ];

  // এডমিন যদি ডাটা দিয়ে থাকে তা দেখাবে, ডাটা ফালতু বা খালি থাকলে ডিফল্ট দেখাবে
  const displayDepts = (departments && departments.length > 0) ? departments : defaultDepts;

  return (
    <div className="my-12 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 border-b-2 pb-3">
        Our Departments
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {displayDepts.map((dept, index) => {
          const defaultIcon = defaultDepts[index % defaultDepts.length].logo;
          
          const finalName = dept?.name && dept.name.trim() !== '' 
            ? dept.name 
            : 'Department';

          const isImgUrl = dept?.logo && (dept.logo.startsWith('http://') || dept.logo.startsWith('https://'));
          const finalLogo = isImgUrl ? dept.logo : defaultIcon;

          return (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-2xl transition-all border border-gray-100 hover:-translate-y-2 h-44"
            >
              <div className="w-16 h-16 mb-3 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50">
                <img 
                  src={finalLogo} 
                  alt={finalName} 
                  className="w-12 h-12 object-contain"
                  onError={(e) => { e.target.src = defaultIcon; }}
                />
              </div>
              <h3 className="text-xs font-bold text-center text-gray-700 line-clamp-2">
                {finalName}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentsSection;