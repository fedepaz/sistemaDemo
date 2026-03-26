// src/features/dashboard/components/company-info-card.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  BadgeCheck,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileText,
  HashIcon,
} from "lucide-react";
import { COMPANY_DATA } from "@/lib/config/company";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

function InfoRow({ icon, label, value, href }: InfoRowProps) {
  const content = (
    <p className="text-sm font-medium text-foreground mt-0.5 break-words hover:text-primary transition-colors">
      {value}
    </p>
  );

  return (
    <div className="flex items-start gap-3 py-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {href ? (
          <a href={href} className="block">
            {content}
          </a>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

export function CompanyInfoCard() {
  return (
    <Card className="h-full border-0 shadow-sm bg-card overflow-hidden" role="region" aria-label="Información de la empresa">
      <CardContent className="p-0">
        {/* Header with Logo Area */}
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Logo Area */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-inner">
                <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm" title="Verificado">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Company Name & Status */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-balance">
                {COMPANY_DATA.nombre}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                {COMPANY_DATA.tipo}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <Badge variant="secondary" className="text-xs font-semibold">
                  <Globe className="w-3 h-3 mr-1" />
                  {COMPANY_DATA.pais}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 font-bold"
                >
                  {COMPANY_DATA.situacion}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Company Information Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            {/* Left Column - Location */}
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                Ubicación Operativa
              </h3>
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Dirección"
                value={COMPANY_DATA.direccion}
              />
              <InfoRow
                icon={<Building2 className="w-4 h-4" />}
                label="Localidad"
                value={`${COMPANY_DATA.localidad}, ${COMPANY_DATA.provincia}`}
              />
              <InfoRow
                icon={<HashIcon className="w-4 h-4" />}
                label="Código Postal"
                value={COMPANY_DATA.codPos}
              />
            </div>

            {/* Right Column - Contact & Legal */}
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                Contacto & Legal
              </h3>
              <InfoRow
                icon={<Phone className="w-4 h-4" />}
                label="Teléfono"
                value={COMPANY_DATA.telefono}
                href={`tel:${COMPANY_DATA.telefono.replace(/[^\d+]/g, '')}`}
              />
              <InfoRow
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={COMPANY_DATA.mail}
                href={`mailto:${COMPANY_DATA.mail}`}
              />
              <InfoRow
                icon={<FileText className="w-4 h-4" />}
                label="CUIT"
                value={COMPANY_DATA.cuit}
              />
            </div>
          </div>

          {/* Bottom Section - Tax Info */}
          <Separator className="my-6 opacity-50" />
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60">Ing. Brutos:</span>
              <span className="text-foreground">{COMPANY_DATA.ingBrutos}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/60">Situación IVA:</span>
              <span className="text-foreground">{COMPANY_DATA.situacion}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
