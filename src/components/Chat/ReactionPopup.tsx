import { doc, updateDoc } from 'firebase/firestore';
import { FC, Ref } from 'react';
import { useParams } from 'react-router-dom';

import { REACTIONS_UI } from '@shared/constants';
import { db } from '@shared/firebase';
import { useStore } from '../../store';

interface ReactionPopupProps {
  position: 'left' | 'right';
  forwardedRef: Ref<HTMLDivElement>;
  setIsOpened: (value: boolean) => void;
  messageId: string;
  currentReaction: number;
}

const ReactionPopup: FC<ReactionPopupProps> = ({ position, forwardedRef, setIsOpened, messageId, currentReaction }) => {
  const { id: conversationId } = useParams();

  const currentUser = useStore((state) => state.currentUser);

  const updateReaction = (value: number) => {
    updateDoc(doc(db, 'conversations', conversationId as string, 'messages', messageId), {
      [`reactions.${currentUser?.uid}`]: value,
    });
  };

  return (
    <div
      ref={forwardedRef}
      className={`absolute bottom-[calc(100%+5px)] z-[1] flex animate-fade-in gap-1 rounded-full bg-dark-lighten p-[6px] shadow ${
        position === 'left' ? 'left-8' : 'right-8'
      }`}
    >
      {Object.entries(REACTIONS_UI).map(([key, value], index) => (
        <div
          key={key}
          className={`${
            index + 1 === currentReaction
              ? 'relative after:absolute after:left-1/2 after:top-full after:h-[5px] after:w-[5px] after:-translate-x-1/2 after:rounded-full after:bg-primary'
              : ''
          }`}
        >
          <img
            onClick={() => {
              if (index + 1 === currentReaction) updateReaction(0);
              else updateReaction(index + 1);
              setIsOpened(false);
            }}
            title={key}
            className={`h-7 w-7 origin-bottom cursor-pointer transition duration-300 hover:scale-[115%]`}
            src={value.gif}
            alt=""
          />
        </div>
      ))}
    </div>
  );
};

export default ReactionPopup;
