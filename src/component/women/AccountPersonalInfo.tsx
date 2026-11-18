import React from "react";
import { Link } from "react-router-dom";

const AccountPersonalInfo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/">Home</Link> /{" "}
        <span className="text-gray-500">My Account</span> /{" "}
        <span className="text-black">Personal Info</span>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="col-span-3 border-r pr-6">
          <h2 className="text-lg font-semibold mb-6">Hello Jhanvi</h2>
          <p className="text-sm text-gray-500 mb-8">Welcome to your Account</p>
          <ul className="space-y-4">
            <li>
              <Link
                to="/account/orders"
                className="text-gray-700 hover:text-black"
              >
                My Orders
              </Link>
            </li>
            <li>
              <Link
                to="/account/wishlist"
                className="text-gray-700 hover:text-black"
              >
                Wishlist
              </Link>
            </li>
            <li>
              <Link
                to="/account/info"
                className="text-black font-semibold"
              >
                My Info
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="text-gray-700 hover:text-black"
              >
                Sign Out
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <h2 className="text-xl font-semibold mb-8">My Info</h2>

          {/* Contact Details */}
          <div className="mb-10">
            <h3 className="text-lg font-medium mb-4">Contact Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span>Your Name: Jhanvi Shah</span>
                <button className="text-blue-500">Change</button>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Email Address: Jhanvi@gmail.com</span>
                <button className="text-blue-500">Change</button>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Phone Number: 8980523445</span>
                <button className="text-blue-500">Change</button>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Password: ****</span>
                <button className="text-blue-500">Change</button>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Address</h3>
              <button className="text-blue-500">Add New</button>
            </div>

            {/* Address Cards */}
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium">Jhanvi Shah</h4>
                  <p className="text-gray-600 text-sm">8980523445</p>
                  <p className="text-gray-600 text-sm mb-3">
                    14 Pragati Nagar Flats, opp Jain Derasar, near Jain Derasar,
                    Vyasnagar road
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <button className="px-3 py-1 text-sm border rounded">
                      Home
                    </button>
                    <button className="px-3 py-1 text-sm border rounded">
                      Default billing address
                    </button>
                  </div>

                  <div className="flex justify-between text-sm">
                    <button className="text-gray-500">Remove</button>
                    <button className="text-gray-500">Edit</button>
                    <button className="text-blue-500">Set as default</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPersonalInfo;
