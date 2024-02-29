import satori, { type Font } from 'satori';
import { Resvg } from '@resvg/resvg-js';

export interface User {
  handle: string;
  class: number;
  badgeId: string;
  backgroundId: string;
  profileImageUrl: string;
  solvedCount: number;
  tier: number;
  rating: number;
  arenaTier: number;
  arenaRating: number;
  rank: number;
}

const tierColor = [
  'rgb(45, 45, 45)',
  'rgb(157, 73, 0)',
  'rgb(165, 79, 0)',
  'rgb(173, 86, 0)',
  'rgb(181, 93, 10)',
  'rgb(198, 119, 57)',
  'rgb(56, 84, 110)',
  'rgb(61, 90, 116)',
  'rgb(67, 95, 122)',
  'rgb(73, 101, 128)',
  'rgb(78, 106, 134)',
  'rgb(210, 133, 0)',
  'rgb(223, 143, 0)',
  'rgb(236, 154, 0)',
  'rgb(249, 165, 24)',
  'rgb(255, 176, 40)',
  'rgb(0, 199, 139)',
  'rgb(0, 212, 151)',
  'rgb(39, 226, 164)',
  'rgb(62, 240, 177)',
  'rgb(81, 253, 189)',
  'rgb(0, 158, 229)',
  'rgb(0, 169, 240)',
  'rgb(0, 180, 252)',
  'rgb(43, 191, 255)',
  'rgb(65, 202, 255)',
  'rgb(224, 0, 76)',
  'rgb(234, 0, 83)',
  'rgb(245, 0, 90)',
  'rgb(255, 0, 98)',
  'rgb(255, 48, 113)',
  'rgb(179, 0, 224)',
];

const tierGradient = [
  'linear-gradient(to right, rgb(185, 188, 195) 0%, rgb(233, 237, 241) 100%)',
  'linear-gradient(to right, rgb(173, 86, 0) 0%, rgb(232, 77, 11) 100%)',
  'linear-gradient(to right, rgb(93, 122, 149) 0%, rgb(117, 168, 215) 100%)',
  'linear-gradient(to right, rgb(236, 154, 0) 0%, rgb(255, 208, 0) 100%)',
  'linear-gradient(to right, #27e2a4 0%, #27d9e2 100%)',
  'linear-gradient(to right, #00b4fc 0%, #0068fc 100%)',
  'linear-gradient(to right, #ff0062 0%, #ff0000 100%)',
  'linear-gradient(to right, rgb(255, 124, 168) 0%, rgb(180, 145, 255) 50%, rgb(124, 249, 255) 100%)',
];

const tierRating = [
  0, 30, 60, 90, 120, 150, 200, 300, 400, 500, 650, 800, 950, 1100, 1250, 1400,
  1600, 1750, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2850,
  2900, 2950, 3000, 3000,
];

export async function createUserImage(user: User) {
  const showBackground = await fetch(
    `https://solved.ac/api/v3/background/show?backgroundId=${user.backgroundId}`,
  );
  const { backgroundImageUrl } = await showBackground.json();
  const showBadge = await fetch(
    `https://solved.ac/api/v3/badge/show?badgeId=${user.badgeId}`,
  );
  const { badgeImageUrl } = await showBadge.json();
  const profileImageUrl =
    user.profileImageUrl ??
    'https://static.solved.ac/misc/360x360/default_profile.png';
  const pretendardRegular = await loadFont(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Regular.woff',
  );
  const pretendardBold = await loadFont(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/static/woff/Pretendard-Bold.woff',
  );
  const fonts: Font[] = [
    {
      name: 'Pretendard',
      data: pretendardRegular,
      weight: 400,
    },
    {
      name: 'Pretendard',
      data: pretendardBold,
      weight: 600,
    },
  ];
  const getTier = await fetch(
    `https://static.solved.ac/tier_small/${user.tier}.svg`,
  );
  const tierSvg = await getTier.text();
  const tierSvgBegin = tierSvg.indexOf('<svg');
  const tierImage = `data:image/svg+xml,${tierSvg
    .slice(tierSvgBegin)
    .replace(/[가-힣]/g, '')
    .replace(/\n/g, '')}`;
  const getArena = await fetch(
    `https://static.solved.ac/tier_arena/${user.arenaTier}.svg`,
  );
  const arenaSvg = await getArena.text();
  const arenaImage = `data:image/svg+xml,${arenaSvg.replace(/[가-힣]/g, '')}`;
  let classImage;
  if (user.class > 0) {
    const getSvg = await fetch(
      `https://static.solved.ac/class/c${user.class}.svg`,
    );
    const svg = await getSvg.text();
    classImage = `data:image/svg+xml,${svg.replace(/[가-힣]/g, '')}`;
  }
  const shadow =
    tierColor[user.tier].replace('rgb', 'rgba').slice(undefined, -1) + ', 0.6)';
  const fill =
    user.tier < 31
      ? {
          color: tierColor[user.tier],
        }
      : {
          color: 'rgb(180, 145, 255)',
        };
  const svg = await satori(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        color: '#000000',
      }}
    >
      <img
        src={backgroundImageUrl}
        style={{
          marginTop: -50,
        }}
      />
      <div
        style={{
          marginTop: -100,
          height: 80,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingRight: 100,
          alignItems: 'stretch',
          borderBottom: '1px solid rgb(221, 223, 224)',
          fontSize: 30,
          fontWeight: 600,
          color: 'rgb(138, 143, 149)',
          gap: 36,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <img src={tierImage} style={{ height: 36, width: 28 }} />
          <span>문제해결</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <img src={arenaImage} style={{ height: 32 }} />
          <span>아레나</span>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 100,
          paddingRight: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            marginBottom: 40,
          }}
        >
          <img
            src={profileImageUrl}
            style={{
              marginTop: -120,
              marginRight: 40,
              width: 240,
              height: 240,
              borderRadius: '50%',
              boxShadow: `0px 16px 32px ${shadow}`,
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 54,
                fontWeight: 600,
              }}
            >
              {user.handle}
            </div>
            <img
              src={badgeImageUrl}
              style={{
                marginLeft: 20,
                width: 90,
                height: 90,
              }}
            />
            {classImage && (
              <img
                src={classImage}
                style={{
                  marginLeft: 10,
                  width: 90,
                  height: 90,
                }}
              />
            )}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 4,
            fontSize: 32,
            ...fill,
          }}
        >
          <span style={{ fontWeight: 600 }}>{tierName(user.tier)}</span>
          <span>{user.rating}</span>
        </div>
        <div
          style={{
            display: 'flex',
            background: 'rgb(11, 19, 27)',
            borderRadius: 9,
            height: 48,
            marginTop: 16,
          }}
        >
          <div
            style={{
              borderRadius: 8,
              width: `${Math.min(100, ((user.rating - tierRating[user.tier]) * 100) / (tierRating[user.tier + 1] - tierRating[user.tier]))}%`,
              background: tierGradient[Math.floor((user.tier + 4) / 5)],
            }}
          />
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
      embedFont: true,
    },
  );
  return new Resvg(svg, {
    imageRendering: 1,
  })
    .render()
    .asPng();
}

function loadFont(url: string) {
  return fetch(url).then((r) => r.arrayBuffer());
}

function tierName(tier: number) {
  const subText = ['V', 'IV', 'III', 'II', 'I'][(tier + 4) % 5];
  if (tier >= 31) return 'Master';
  if (tier >= 26) return `Ruby ${subText}`;
  if (tier >= 21) return `Diamond ${subText}`;
  if (tier >= 16) return `Platinum ${subText}`;
  if (tier >= 11) return `Gold ${subText}`;
  if (tier >= 6) return `Silver ${subText}`;
  if (tier >= 1) return `Bronze ${subText}`;
  return 'Unrated';
}
