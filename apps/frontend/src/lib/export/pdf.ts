import pdfMakeModule from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { poppinsVfs } from "./fonts/poppins-vfs";
import type { ExportOptions, CompanyConfig } from "./types";
import { generateFilename } from "./file-utils";
import { EXPORT_CONFIG } from "@/constants/export-config";

// Register fonts - pdfmake default export has addVirtualFileSystem at runtime
// but types don't match, so we use type assertion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfMake = pdfMakeModule as any;
pdfMake.addVirtualFileSystem(pdfFonts);
pdfMake.addVirtualFileSystem(poppinsVfs);

// Register Poppins alongside default Roboto
pdfMake.addFonts({
  Poppins: {
    normal: "Poppins-Regular.ttf",
    bold: "Poppins-Bold.ttf",
    italics: "Poppins-Regular.ttf",
    bolditalics: "Poppins-Bold.ttf",
  },
});

const LOGO_KEY = "company-logo";

function resolveCompany(cfg?: CompanyConfig) {
  return {
    name: cfg?.name || EXPORT_CONFIG.company.name,
    tagline: EXPORT_CONFIG.company.tagline,
    address: cfg?.address,
    city: cfg?.city,
    province: cfg?.province,
    phone: cfg?.phone,
    email: cfg?.email,
    taxId: cfg?.taxId,
    country: cfg?.country,
  };
}

async function fetchLogoAsDataURL(): Promise<string | null> {
  try {
    const response = await fetch(EXPORT_CONFIG.company.logoUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportToPDF<T extends Record<string, unknown>>(
  options: ExportOptions<T>,
): Promise<void> {
  const { data, columns, title, filename, companyConfig } = options;
  const finalFilename = filename ?? generateFilename(title, "pdf");

  const {
    primary,
    primaryFg,
    accent,
    mutedFg,
    border,
    background,
    fontSize,
    margins,
    pageSize,
  } = EXPORT_CONFIG.pdf;

  const company = resolveCompany(companyConfig);
  const logoDataURL = await fetchLogoAsDataURL();

  // A4 width = 595pt, minus left+right margins = available content width
  const contentWidth = 595 - margins.left - margins.right;

  // Build address line from config (if available)
  const addressParts = [company.address, company.city, company.province].filter(
    Boolean,
  );
  const addressLine = addressParts.join(", ");
  const contactParts = [company.phone, company.email].filter(Boolean);
  const contactLine = contactParts.join(" | ");

  // Build table header
  const tableHeader = columns.map((col) => ({
    text: col.exportHeader,
    style: "tableHeader",
    bold: true,
    color: primaryFg,
  }));

  // Build table body
  const tableBody = data.map((row, rowIndex) =>
    columns.map((col) => {
      let value: string | number;
      if (col.exportValue) {
        value = col.exportValue(row[col.accessorKey], row);
      } else {
        value = row[col.accessorKey] as string | number;
      }
      return {
        text: String(value ?? ""),
        style: rowIndex % 2 === 0 ? "tableRowEven" : "tableRowOdd",
      };
    }),
  );

  const HEADER_INSET = 15; // tighter than body margins — logo/title sit closer to the edge

  // Right column: company name + address/tagline
  const rightColumn: Array<Record<string, unknown>> = [
    {
      text: company.name,
      font: "Poppins",
      alignment: "right" as const,
      fontSize: fontSize + 5,
      bold: true,
      color: primary,
    },
  ];

  if (addressLine) {
    rightColumn.push({
      text: addressLine,
      alignment: "right" as const,
      fontSize: fontSize,
      color: mutedFg,
      margin: [0, 1, 0, 0] as [number, number, number, number],
    });
  }
  if (contactLine) {
    rightColumn.push({
      text: contactLine,
      alignment: "right" as const,
      fontSize: fontSize,
      color: mutedFg,
      margin: [0, 1, 0, 0] as [number, number, number, number],
    });
  }
  if (!addressLine && !contactLine) {
    // Fallback: show tagline when no config data
    rightColumn.push({
      text: company.tagline ?? "Sistema de Gestión",
      alignment: "right" as const,
      fontSize: fontSize,
      color: mutedFg,
      margin: [0, 2, 0, 0] as [number, number, number, number],
    });
  }

  // Letterhead: logo left, company name + tagline right, separated by a rule
  const headerBlock = {
    margin: [HEADER_INSET, 15, HEADER_INSET, 0] as [
      number,
      number,
      number,
      number,
    ],
    stack: [
      {
        columns: [
          logoDataURL
            ? { image: LOGO_KEY, width: 90, fit: [90, 45] as [number, number] }
            : { text: "", width: 90 },
          {
            width: "*",
            stack: rightColumn,
          },
        ],
        columnGap: 12,
      },
      {
        canvas: [
          {
            type: "line" as const,
            x1: 0,
            y1: 0,
            x2: contentWidth,
            y2: 0,
            lineWidth: 1,
            lineColor: primary,
          },
        ],
        margin: [0, 12, 0, 0] as [number, number, number, number],
      },
    ],
  };

  // Build subject line for metadata
  const subjectParts = [company.taxId, company.address].filter(Boolean);
  const subject = subjectParts.join(" - ");

  const docDefinition = {
    pageSize,
    pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
    ...(logoDataURL && { images: { [LOGO_KEY]: logoDataURL } }),
    info: {
      title,
      author: company.name,
      ...(subject && { subject }),
      creator: "Sistema de Gestión",
    },
    defaultStyle: {
      font: "Roboto",
    },
    header: headerBlock,
    content: [
      {
        text: title,
        style: "title",
        margin: [0, 0, 0, 4] as [number, number, number, number],
      },
      {
        text: `Fecha: ${new Date().toLocaleDateString("es-AR")}`,
        style: "date",
      },
      {
        table: {
          headerRows: 1,
          widths: columns.map((col) => col.pdfWidth),
          body: [tableHeader, ...tableBody],
        },
        width: "100%",
        layout: {
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 1 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: () => border,
          vLineColor: () => border,
          fillColor: (rowIndex: number) =>
            rowIndex === 0 ? primary : rowIndex % 2 === 0 ? accent : background,
          paddingLeft: () => 1,
          paddingRight: () => 1,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
      },
    ],
    styles: {
      title: {
        font: "Poppins",
        fontSize: fontSize + 6,
        bold: true,
        color: primary,
      },
      date: {
        fontSize,
        margin: [0, 0, 0, 16] as [number, number, number, number],
        color: mutedFg,
      },
      tableHeader: {
        font: "Poppins",
        fontSize,
        bold: true,
        color: primaryFg,
      },
      tableRowEven: {
        fontSize,
      },
      tableRowOdd: {
        fontSize,
      },
    },
    footer: ((currentPage: number, pageCount: number) => ({
      margin: [30, 0, 30, 15] as [number, number, number, number],
      stack: [
        {
          canvas: [
            {
              type: "line" as const,
              x1: 0,
              y1: 0,
              x2: contentWidth,
              y2: 0,
              lineWidth: 0.5,
              lineColor: border,
            },
          ],
        },
        {
          columns: [
            {
              text: `Página ${currentPage} de ${pageCount}`,
              fontSize: fontSize - 2,
              color: mutedFg,
            },
            {
              text: company.name,
              font: "Poppins",
              alignment: "right" as const,
              fontSize: fontSize - 2,
              bold: true,
              color: primary,
            },
          ],
          margin: [0, 6, 0, 0] as [number, number, number, number],
        },
      ],
    })) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfMake.createPdf(docDefinition as any).download(finalFilename);
}
