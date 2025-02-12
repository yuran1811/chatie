import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { FC } from 'react';
import Spin from 'react-cssfx-loading/src/Spin';
import { useParams } from 'react-router-dom';

import { useUsersInfo } from '@/hooks/useUsersInfo';
import { IMAGE_PROXY } from '@shared/constants';
import { db } from '@shared/firebase';
import { ConversationInfo, SavedUser } from '@shared/types';
import { useStore } from '../../store';

interface AdminProps {
  conversation: ConversationInfo;
}

const Admin: FC<AdminProps> = ({ conversation }) => {
  const { id: conversationId } = useParams();

  const currentUser = useStore((state) => state.currentUser);

  const { data, loading, error } = useUsersInfo(conversation.group?.admins as string[]);

  const handleRemoveAdminPosition = (uid: string) => {
    updateDoc(doc(db, 'conversations', conversationId as string), {
      'group.admins': arrayRemove(uid),
      'group.groupImage': conversation.group?.groupImage,
      'group.groupName': conversation.group?.groupName,
    });
  };

  if (loading || error)
    return (
      <div className="flex h-80 items-center justify-center">
        <Spin />
      </div>
    );

  return (
    <div className="flex h-80 flex-col items-stretch gap-4 overflow-y-auto overflow-x-hidden py-4">
      {data
        ?.map((item) => item.data() as SavedUser)
        .map((user) => (
          <div key={user.uid} className="flex items-center gap-3 px-4">
            <img
              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              src={IMAGE_PROXY(user.photoURL)}
              alt=""
            />

            <div className="flex-grow">
              <h1>{user.displayName}</h1>
            </div>

            {conversation.group?.admins?.includes(currentUser?.uid as string) && user.uid !== currentUser?.uid && (
              <div className="group relative flex-shrink-0" tabIndex={0}>
                <button>
                  <i className="bx bx-dots-horizontal-rounded text-2xl"></i>
                </button>

                <div className="invisible absolute top-full right-0 z-[1] flex w-max flex-col items-stretch rounded-lg border border-dark-lighten bg-dark-lighten py-1 opacity-0 transition-all duration-300 group-focus-within:!visible group-focus-within:!opacity-100">
                  <button
                    onClick={() => handleRemoveAdminPosition(user.uid)}
                    className="flex items-center gap-1 bg-dark-lighten px-3 py-1 transition duration-300 hover:brightness-125"
                  >
                    <i className="bx bx-user-x text-2xl"></i>
                    <span>Remove admin position</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Admin;
