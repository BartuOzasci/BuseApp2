import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
      <div className="max-w-lg mx-auto px-4 py-4 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-pink-300 ring-offset-2 mb-2">
          <img
            src="/logo.jpeg"
            alt="Buse Acar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg">BA</div>';
            }}
          />
        </div>
        <span className="text-sm text-pink-400 font-body tracking-widest uppercase">
          Hoşgeldin
        </span>
        <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent leading-tight">
          Buse Acar
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;
