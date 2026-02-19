import React from "react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-pink-300 ring-offset-2 flex-shrink-0">
          <img
            src="/logo.jpeg"
            alt="Buse Acar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.innerHTML =
                '<div class="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm">BA</div>';
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-pink-400 font-body tracking-wide uppercase">
            Hoşgeldin
          </span>
          <h1 className="text-lg font-display font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent leading-tight">
            Buse Acar
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-gray-400 font-body">Çevrimiçi</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
