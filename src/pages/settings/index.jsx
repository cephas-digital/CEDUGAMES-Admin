import React, { useState } from "react";
import banner from "../../assets/settin.png";
import admin from "../../assets/admin.png";
import {
  DeleteUser,
  SuccessfulDelete,
  SuccessModal,
} from "../../components/modal";
import CTA from "../../assets/cta.png";
import SettingsPage from "../../components/account-setting/other-setting";
import { FullBTN } from "../../components/button.jsx/Btn";
import BadgeSettings from "../../components/account-setting/badge-settings";

export default function AccountProfile() {
  const [activeTab, setActiveTab] = useState("Update Profile");
  const [updatePassword, setUpdatePassword] = useState(false);
  const [profile, setProfile] = useState(false);
  const [leadershipSetting, setLeadershipSetting] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [openSuccessfulDeleteModal, setOpenSuccessfulDeleteModal] =
    useState(false);

  const [editbadge, setEditBadge] = useState(false);

  const [badge, setBadge] = useState(false);

  const confirmDelete = () => {
    setOpenDelete(false);
    setOpenSuccessfulDeleteModal(true);
  };

  const closeSuccessfulDeleteModal = () => setOpenSuccessfulDeleteModal(false);

  const openModal = () => setOpenDelete(true);
  const openBadge = () => setBadge(true);

  const tabs = [
    "Update Profile",
    "Update Password",
    "Leaderboard Settings",
    "Badge Settings",
    "Other Settings",
  ];
  const Saveprofile = () => setProfile(true);
  const openUpdatePassword = () => setUpdatePassword(true);
  const openSetting = () => setLeadershipSetting(true);
  const badges = [
    {
      id: 1,
      name: "Explorer",
      type: "Bronze",
      criteria: "Complete 5 different games",
    },
    {
      id: 2,
      name: "Adventurer",
      type: "Silver",
      criteria: "Complete 10 different games",
    },
    {
      id: 3,
      name: "Mastermind",
      type: "Gold",
      criteria: "Complete all games",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen bg-gray-50 p-6 font-Outfit">
      <h2 className="text-xl font-semibold mb-4">Account Profile</h2>

      <div className="flex items-center font-bold gap-6 border-b pb-2 text-base">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`pb-2 transition-all duration-200 ${
              activeTab === item
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {activeTab === "Update Profile" && (
        <div>
          <div className="mt-6 p-4">
            <div className="relative w-full h-64 rounded-xl overflow-hidden">
              <img
                src={banner}
                alt="cover"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-center -mt-16">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img
                  src={admin}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow cursor-pointer text-xs">
                  ✏️
                </div>
              </div>
            </div>

            <div className="mt-8 w-full grid gap-6">
              <div className="max-w-xl">
                <div>
                  <label className="text-sm text-gray-600">Profile Name</label>
                  <input className="w-full mt-1 p-3 border outline-none rounded-xl bg-gray-100" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Profile Email</label>
                  <input className="w-full mt-1 p-3 border outline-none rounded-xl bg-gray-100" />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <input className="w-full mt-1 p-3 border outline-none rounded-xl bg-gray-100" />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={Saveprofile}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl shadow"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>

          <SuccessModal
            isOpen={profile}
            onClose={() => setProfile(false)}
          >
            <div className="text-center ">
              <img
                src={CTA}
                alt="cta"
                className=" w-28 h-28 mx-auto"
              />
              <p className=" text-2xl font-bold mb-4">Profile Updated!</p>
              <p className=" text-lg mb-4">
                Your profile have been updated successfully
              </p>

              <FullBTN onClick={() => setProfile(false)}>Okay</FullBTN>
            </div>
          </SuccessModal>
        </div>
      )}

      {activeTab === "Update Password" && (
        // <div className="mt-6 rounded-xl shadow-sm p-6 text-center text-gray-600">
        //   <form>
        //     <label>Current Password</label>
        //     <input
        //       type="text"
        //       placeholder="Current Password"
        //     />

        //     <div>
        //       <label>New Password</label>
        //       <input
        //         type="text"
        //         placeholder="New password "
        //       />
        //     </div>

        //     <div>
        //       <label>Confirm New Password</label>
        //       <input
        //         type="text"
        //         placeholder="Confirm New Password"
        //       />
        //     </div>

        //     <input
        //       type="submit"
        //       value="Update Password"
        //     />
        //   </form>
        // </div>
        <div>
          <div className="min-h-screen  px-6 py-10">
            <div className="max-w-lg">
              {/* Current Password */}
              <div className="mb-6">
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Current Password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* New Password */}
              <div className="mb-6">
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Confirm New Password */}
              <div className="mb-8">
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Button */}
              <button
                onClick={openUpdatePassword}
                className="rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700 transition"
              >
                Update Password
              </button>
            </div>
          </div>

          <SuccessModal
            isOpen={updatePassword}
            onClose={() => setUpdatePassword(false)}
          >
            <div className="text-center ">
              <img
                src={CTA}
                alt="cta"
                className=" w-28 h-28 mx-auto"
              />
              <p className=" text-2xl font-bold mb-4">Password Updated!</p>
              <p className=" text-lg mb-4">
                Your Password have been added successfully
              </p>

              <FullBTN onClick={() => setUpdatePassword(false)}>Okay</FullBTN>
            </div>
          </SuccessModal>
        </div>
      )}

      {activeTab === "Leaderboard Settings" && (
        <div>
          <div className="min-h-screen px-6 py-10">
            <div className="max-w-xl">
              <h2 className="mb-8 text-2xl font-bold text-gray-900">
                Leaderboard Settings
              </h2>

              <div className="mb-6">
                <label className="mb-2 block text-base font-semibold text-gray-900">
                  Number of players to display
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-base font-semibold text-gray-900">
                  Ranking Criteria
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-base font-semibold text-gray-900">
                  Ranking Points
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="mb-8">
                <label className="mb-2 block text-base font-semibold text-gray-900">
                  Leaderboard Ranking Description
                </label>
                <textarea
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Button */}
              <button
                onClick={openSetting}
                className="rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-purple-700"
              >
                Update Settings
              </button>
            </div>
          </div>

          <SuccessModal
            isOpen={leadershipSetting}
            onClose={() => setLeadershipSetting(false)}
          >
            <div className="text-center ">
              <img
                src={CTA}
                alt="cta"
                className=" w-28 h-28 mx-auto"
              />
              <p className=" text-2xl font-bold mb-4">Settings Updated!</p>
              <p className=" text-lg mb-4">
                Leaderboard settings have been added successfully
              </p>

              <FullBTN onClick={() => setLeadershipSetting(false)}>
                Okay
              </FullBTN>
            </div>
          </SuccessModal>
        </div>
      )}

      {activeTab === "Badge Settings" && <BadgeSettings />}

      {activeTab === "__Legacy Badge Settings" && (
        <div>
          {!editbadge ? (
            <div className=" p-6">
              <div className="max-w-6xl">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  New Badge
                </h2>

                <div className="mb-6 max-w-xl">
                  <label className="mb-2 block text-base font-semibold text-gray-900">
                    Badge Name
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6 max-w-xl">
                  <label className="mb-2 block text-base font-semibold text-gray-900">
                    Badge Type
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6 max-w-xl">
                  <label className="mb-2 block text-base font-semibold text-gray-900">
                    Criteria for Earning Badge
                  </label>
                  <textarea
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={openBadge}
                  className="mb-12 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  Add Badge
                </button>

                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Manage Badges
                </h2>

                <div className="overflow-hidden rounded-xl bg-white border border-[#DBDEE5]">
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Badge Name
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Badge Type
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Criteria
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {badges.map((badge) => (
                        <tr
                          key={badge.id}
                          className="border-t"
                        >
                          <td className="px-6 py-4 text-gray-900">
                            {badge.name}
                          </td>
                          <td className="px-6 py-4 text-[#61708A]">
                            {badge.type}
                          </td>
                          <td className="px-6 py-4 text-[#61708A]">
                            {badge.criteria}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setEditBadge(true)}
                              className="mr-3 font-medium text-purple-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={openModal}
                              className="font-medium text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <SuccessModal
                isOpen={badge}
                onClose={() => setBadge(false)}
              >
                <div className="text-center ">
                  <img
                    src={CTA}
                    alt="cta"
                    className=" w-28 h-28 mx-auto"
                  />
                  <p className=" text-2xl font-bold mb-4">Action Success</p>
                  <p className=" text-base mb-4">
                    New badge has been added successfully
                  </p>

                  <FullBTN onClick={() => setBadge(false)}>Okay</FullBTN>
                </div>
              </SuccessModal>

              <DeleteUser
                isOpen={openDelete}
                onClose={() => setOpenDelete(false)}
              >
                <div className="w-28 h-28 mx-auto">
                  <img
                    src={CTA}
                    alt="cta"
                    className="w-full h-full "
                  />
                </div>
                <div className="mx-auto text-center">
                  <p className="text-2xl font-bold py-2">Confirm Action</p>
                  <p>
                    Are you sure you want to delete badge? Action cannot be
                    reversed
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    className="border border-[#995BE2] text-[#995BE2] text-[16px] font-medium py-2 px-4 rounded-xl w-[130px]"
                    onClick={() => setOpenDelete(false)}
                  >
                    No
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="text-[16px] bg-[#995BE2] text-white font-medium py-2 px-4 rounded-[10px] w-[130px]"
                  >
                    Yes
                  </button>
                </div>
              </DeleteUser>

              <SuccessfulDelete
                isOpen={openSuccessfulDeleteModal}
                onClose={closeSuccessfulDeleteModal}
              >
                <div>
                  <div>
                    <img
                      src={CTA}
                      alt=" verify delete"
                      className=" w-28 h-28 mx-auto"
                    />
                  </div>

                  <h2 className="text-[#000000] text-center text-[22px] leading-[27px] font-bold mb-4">
                    Action Completed!
                  </h2>
                  <p className="text-[#000000] text-center mb-4  text-[14px] leading-[18.9px]">
                    <span className="font-bold">Badge "Name"</span> has been
                    deleted succcessfully,
                  </p>

                  <div className=" mx-auto justify-center flex items-center">
                    <FullBTN
                      onClick={() => setOpenSuccessfulDeleteModal(false)}
                    >
                      Okay
                    </FullBTN>
                  </div>
                </div>
              </SuccessfulDelete>
            </div>
          ) : (
            <div>
              <div>
                <div className="min-h-screen  px-6 py-10">
                  <p className=" text-2xl font-bold mb-4">Edit Badge</p>

                  <div className="max-w-lg">
                    <div className="mb-6">
                      <label className="block text-base font-semibold text-gray-900 mb-2">
                        Badge Name
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-base font-semibold text-gray-900 mb-2">
                        Badge Type
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="mb-8">
                      <label className="mb-2 block text-base font-semibold text-gray-900">
                        Criteria for Earning Badge
                      </label>
                      <textarea
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    {/* Button */}
                    <button
                      onClick={openUpdatePassword}
                      className="rounded-xl bg-purple-600 px-6 py-3 text-base font-semibold text-white hover:bg-purple-700 transition"
                    >
                      Update Badge
                    </button>
                  </div>
                </div>

                <SuccessModal
                  isOpen={updatePassword}
                  onClose={() => setUpdatePassword(false)}
                >
                  <div className="text-center ">
                    <img
                      src={CTA}
                      alt="cta"
                      className=" w-28 h-28 mx-auto"
                    />
                    <p className=" text-2xl font-bold mb-4">Action Success!</p>
                    <p className=" text-lg mb-4">
                      New badge has been added successfully
                    </p>

                    <FullBTN onClick={() => setUpdatePassword(false)}>
                      Okay
                    </FullBTN>
                  </div>
                </SuccessModal>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "Other Settings" && (
        <div>
          <SettingsPage />
        </div>
      )}
    </div>
  );
}
