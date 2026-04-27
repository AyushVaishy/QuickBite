import { useSelector } from "react-redux";
import { FaUser } from "react-icons/fa";

const ProfilePage = () => {
  const user = useSelector((s) => s.auth?.user);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Profile</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <FaUser className="text-orange-500 text-3xl" />
          </div>
          {user ? (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{user.name || user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              {user.role && (
                <span className="mt-2 inline-block text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full font-medium capitalize">
                  {user.role.replace(/_/g, ' ').toLowerCase()}
                </span>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Loading profile…</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
