import React from 'react';

const Leaf: React.FC<{ delay: number, duration: number, top: number, left: number, size: number }> = ({ delay, duration, top, left, size }) => {
    // FIX: Cast the style object to allow custom CSS properties. The default
    // `React.CSSProperties` type might not include definitions for custom
    // properties like `--delay`, causing a TypeScript error.
    const style = {
        '--delay': `${delay}s`,
        '--duration': `${duration}s`,
        '--top': `${top}%`,
        '--left': `${left}%`,
        '--size': `${size}px`,
        position: 'absolute',
        width: 'var(--size)',
        height: 'var(--size)',
        backgroundImage: 'linear-gradient(to bottom right, #4ade80, #86efac)',
        borderRadius: '20% 80%',
        animation: 'fall var(--duration) linear var(--delay) infinite',
        top: '-10%',
        left: 'var(--left)',
        opacity: 0,
    } as React.CSSProperties;
    return <div style={style}></div>;
};

export const SplashScreen: React.FC = () => {
    const leaves = [
        { delay: 0, duration: 8, top: 10, left: 5, size: 20 },
        { delay: 1, duration: 7, top: 20, left: 25, size: 15 },
        { delay: 2, duration: 9, top: 5, left: 55, size: 22 },
        { delay: 3, duration: 6, top: 15, left: 85, size: 18 },
        { delay: 4, duration: 8, top: 25, left: 15, size: 12 },
        { delay: 5, duration: 7.5, top: 0, left: 95, size: 25 },
        { delay: 6, duration: 10, top: 30, left: 45, size: 17 },
    ];

    return (
        <div className="fixed inset-0 bg-primary-50 flex justify-center items-center z-50 overflow-hidden">
            <style>
                {`
                    @keyframes fall {
                        0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                    }
                    @keyframes fadeInText {
                        0% { opacity: 0; transform: translateY(20px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            
            {leaves.map((leaf, index) => (
                <Leaf key={index} {...leaf} />
            ))}
            
            <div className="text-center" style={{ animation: 'fadeInText 1.5s ease-out forwards' }}>
                <h1 className="font-pen text-8xl text-primary-700">늘봄</h1>
                <p className="text-primary-600 mt-2 text-xl">멕시코 몬테레이</p>
            </div>
        </div>
    );
};
