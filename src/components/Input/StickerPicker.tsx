import { FC, Fragment, useState } from 'react';
import Spin from 'react-cssfx-loading/src/Spin';

import { useFetch } from '@/hooks/useFetch';
import { STICKERS_URL } from '@shared/constants';
import { StickerCollections } from '@shared/types';
import ClickAwayListener from '../ClickAwayListener';
import SpriteRenderer from '../SpriteRenderer';

interface StickerPickerOpened {
  onClickAway: (e: any) => void;
  onSelect: (value: string) => void;
}

const getRecentStickers = () => {
  const existing = localStorage.getItem('fireverse-recent-stickers') || '[]';
  try {
    const parsed = JSON.parse(existing);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
};

const StickerPicker: FC<StickerPickerOpened> = ({ onClickAway, onSelect }) => {
  const { data, loading, error } = useFetch<StickerCollections>('sticker', () =>
    fetch(STICKERS_URL).then((res) => res.json()),
  );

  const [recentStickers, setRecentStickers] = useState(getRecentStickers());

  const addRecentSticker = (url: string) => {
    const added = [...new Set([url, ...recentStickers])];

    localStorage.setItem('fireverse-recent-stickers', JSON.stringify(added));

    setRecentStickers(added);
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      {(ref) => (
        <div
          ref={ref}
          className="absolute -left-16 bottom-full h-96 w-96 rounded-lg border-2 border-dark-lighten bg-[#222222] shadow-2xl"
        >
          {loading || error ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spin />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col">
              <div className="flex-grow overflow-y-auto p-3 pt-1">
                {recentStickers.length > 0 && (
                  <>
                    <h1 className="mt-2" id="sticker-recent">
                      Recent stickers
                    </h1>
                    <div className="grid w-full grid-cols-5 justify-between">
                      {recentStickers.map((url) => (
                        <SpriteRenderer
                          key={url}
                          size={60}
                          onClick={(e) => {
                            onSelect(url);
                            addRecentSticker(url);
                            onClickAway(e);
                          }}
                          className="cursor-pointer hover:bg-dark-lighten"
                          src={url}
                          runOnHover
                        />
                      ))}
                    </div>
                  </>
                )}

                {data?.map((collection) => (
                  <Fragment key={collection.id}>
                    <h1 className="mt-2" id={`sticker-${collection.id}`}>
                      {collection.name}
                    </h1>
                    <div className="grid w-full grid-cols-5 justify-between">
                      {collection.stickers.map((sticker) => (
                        <SpriteRenderer
                          key={sticker.spriteURL}
                          size={60}
                          onClick={(e) => {
                            onSelect(sticker.spriteURL);
                            addRecentSticker(sticker.spriteURL);
                            onClickAway(e);
                          }}
                          className="cursor-pointer hover:bg-dark-lighten"
                          src={sticker.spriteURL}
                          runOnHover
                        />
                      ))}
                    </div>
                  </Fragment>
                ))}
              </div>

              <div className="h-18 flex w-full flex-shrink-0 gap-2 overflow-x-auto border-t border-t-dark-lighten p-2">
                {recentStickers.length > 0 && (
                  <button
                    onClick={() => document.querySelector(`#sticker-recent`)?.scrollIntoView()}
                    className="flex h-9 w-9 items-center"
                  >
                    <i className="bx bx-time text-[26px] leading-[26px]"></i>
                  </button>
                )}
                {data?.map((collection) => (
                  <img
                    key={collection.id}
                    onClick={() => document.querySelector(`#sticker-${collection.id}`)?.scrollIntoView()}
                    className="h-9 w-9 cursor-pointer object-cover"
                    src={collection.icon}
                    alt=""
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ClickAwayListener>
  );
};

export default StickerPicker;
