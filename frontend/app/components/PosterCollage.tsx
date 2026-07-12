'use client'

const POSTER_URLS = [
  'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  'https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  'https://image.tmdb.org/t/p/w300/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
  'https://image.tmdb.org/t/p/w300/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg',
  'https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  'https://image.tmdb.org/t/p/w300/6CoRTJTmijhBLJTUNoVSUNxZMEI.jpg',
  'https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  'https://image.tmdb.org/t/p/w300/mMtUybQ6hL24FXo0F3Z4j2KG7kZ.jpg',
  'https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
  'https://image.tmdb.org/t/p/w300/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
  'https://image.tmdb.org/t/p/w300/8kNruSfhk5IoE4eZOc4UpvDn6tq.jpg',
  'https://image.tmdb.org/t/p/w300/A4j8S6moJS2zNtRR8oWF08gRnL5.jpg',
  'https://image.tmdb.org/t/p/w300/rjkmN1dniUHVYAtwuV3Tji7FsDO.jpg',
  'https://image.tmdb.org/t/p/w300/iZf0KyrE25z1sage4SYQLNjmEkR.jpg',
  'https://image.tmdb.org/t/p/w300/q719jXXEzOoYaps6babgKnONONX.jpg',
  'https://image.tmdb.org/t/p/w300/c9XxB3MXYV2kvJkfKDHJOhv9I29.jpg',
  'https://image.tmdb.org/t/p/w300/9O7gLzmreU0nGkIB6K3BsJbzvNv.jpg',
  'https://image.tmdb.org/t/p/w300/lP9GfDPjSPpCzPDGrMjiLe2CMNQ.jpg',
  'https://image.tmdb.org/t/p/w300/nBNZadXqJSdt05SHLqgT0HuC5Gm.jpg',
  'https://image.tmdb.org/t/p/w300/pU1ULUq8D3iRxl1fdX2lZIzdgma.jpg',
  'https://image.tmdb.org/t/p/w300/2vjgEQ1FxRy2bI2KqQfvzTvlx1c.jpg',
  'https://image.tmdb.org/t/p/w300/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg',
  'https://image.tmdb.org/t/p/w300/3bhkrj58Vtu7enYsLMId5mKpgdkLr.jpg',
  'https://image.tmdb.org/t/p/w300/db32LaOibwEliAmSL2jjDF6oDdj.jpg',
  'https://image.tmdb.org/t/p/w300/oU7Oq2KZfbOAgQLZmbuIyFLR0Q.jpg',
  'https://image.tmdb.org/t/p/w300/iEhb00TGPucF0b4GB8awx0tSFMQ.jpg',
  'https://image.tmdb.org/t/p/w300/fiVW06jE7z9YnO4trhaMEdclSiC.jpg',
  'https://image.tmdb.org/t/p/w300/n9N7mLTRO7G0gd7Of9O5uXMTR1W.jpg',
  'https://image.tmdb.org/t/p/w300/5nBaghv6yn3SgK1JPFG1LoNR6sh.jpg',
  'https://image.tmdb.org/t/p/w300/kqjL17yufvn9OVLyXYpvtyrFfak.jpg',
  'https://image.tmdb.org/t/p/w300/f4oZTR45HyMDJnOaxSbP9tqEfzF.jpg',
  'https://image.tmdb.org/t/p/w300/cvsXj3I9Q2iyyIo95AecSd1tad7.jpg',
  'https://image.tmdb.org/t/p/w300/mSDsSDwaP3E7dEfUPWy4J0djnQh.jpg',
  'https://image.tmdb.org/t/p/w300/A7AoNT06aRAc4SV89Dwxj3EYAgC.jpg',
  'https://image.tmdb.org/t/p/w300/hRMfgGFRAZIlvwVIqHMFa1mFkBF.jpg',
  'https://image.tmdb.org/t/p/w300/gvytjFOcvIKEPFHzpqDY30YOVBe.jpg',
  'https://image.tmdb.org/t/p/w300/bV5UhDzLOQuVgpyeTMvV9X0B2oX.jpg',
  'https://image.tmdb.org/t/p/w300/9u9GTfSghTRgNDqPn7kgRM3QXDU.jpg',
  'https://image.tmdb.org/t/p/w300/b9UT9F2zBpXjSmHFpQT0JJGMmGf.jpg',
  'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
]

export default function PosterCollage() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          transform: 'rotate(-8deg) scale(1.3)',
          transformOrigin: 'center center',
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(5, 1fr)',
          gap: '6px',
          height: '130vh',
          width: '130vw',
          marginTop: '-15vh',
          marginLeft: '-15vw',
        }}>
          {POSTER_URLS.map((url, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-md"
              style={{
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.3s ease, brightness 0.3s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
        </div>
      </div>

      {/* Dark overlays — keep hero text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
    </div>
  )
}
