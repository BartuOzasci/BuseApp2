import React from "react";
import { Cloud, CloudOff, HardDrive, RefreshCw, UploadCloud, X } from "lucide-react";

/**
 * Veri kaynağı durumu + yerel veriyi buluta taşıma teklifi.
 * Her şey yolundaysa tek satırlık sessiz bir rozet olarak durur.
 */
const SyncBar = ({
  isRemote,
  status,
  error,
  onRetry,
  migration,
  onMigrate,
  onDismissMigration,
  busy,
}) => (
  <div className="mb-5 space-y-2">
    <div className="flex items-center gap-2">
      {error ? (
        <span className="chip bg-pink-100 text-pink-800">
          <CloudOff size={12} />
          Bulut bağlantısı yok
        </span>
      ) : isRemote ? (
        <span className="chip bg-pink-50 text-pink-700">
          <Cloud size={12} />
          {status === "loading" ? "Buluttan alınıyor" : "Buluta kayıtlı"}
        </span>
      ) : (
        <span className="chip bg-ink-100 text-ink-500">
          <HardDrive size={12} />
          Sadece bu cihazda
        </span>
      )}

      {error && (
        <button
          onClick={onRetry}
          disabled={busy}
          className="chip bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={busy ? "animate-spin" : ""} />
          Tekrar dene
        </button>
      )}
    </div>

    {error && (
      <p className="text-[11px] leading-relaxed text-ink-400">
        Aşağıda bu cihazda saklanan son hali görüyorsun. Yaptığın değişiklikler
        buluta yazılamayabilir. ({error})
      </p>
    )}

    {migration && (
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
            <UploadCloud size={17} className="text-pink-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-ink-800">
              Bu cihazda kayıtlı veri bulundu
            </p>
            <p className="mt-1 text-[12px] text-ink-500 leading-relaxed">
              {migration.followers} takipçi kaydı, {migration.ideas} fikir,{" "}
              {migration.posts} gönderi. Bulut boş — taşımak ister misin?
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={onMigrate}
                disabled={busy}
                className="btn-primary flex-1 py-2.5 text-[13px] disabled:opacity-50"
              >
                {busy ? "Taşınıyor..." : "Buluta Taşı"}
              </button>
              <button
                onClick={onDismissMigration}
                disabled={busy}
                className="px-3 rounded-2xl text-ink-300 hover:text-pink-600 transition-colors"
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default SyncBar;
