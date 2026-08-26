import {
  SiembraRetrasadaDtoSchema,
  FaltaGerminacionDtoSchema,
  FaltantePlantasDtoSchema,
  FaltaPreExpedicionDtoSchema,
  AlertCommentSchema,
  CreateAlertCommentSchema,
} from "../alerts.schema";

describe("SiembraRetrasadaDtoSchema", () => {
  const valid = {
    partidaId: 1045,
    anio: 2026,
    indice: 1,
    codigoEspecie: "EUC01",
    nombreEspecie: "Eucalipto Grandis",
    injerto: "I001",
    nrocont: "48",
    semSiembra: "24-2026",
    fechaSugeridaSiembra: "2026-06-01",
    fSiembra: 0,
    semEntrega: "28-2026 1",
    fEnt: "2026-07-15",
    estado: "PENDIENTE",
    propiedad: "SI",
    commentCount: 0,
  };

  it("accepts valid siembra retrasada", () => {
    const result = SiembraRetrasadaDtoSchema.parse(valid);
    expect(result.partidaId).toBe(1045);
    expect(result.codigoEspecie).toBe("EUC01");
    expect(result.estado).toBe("PENDIENTE");
  });

  it("rejects missing required fields", () => {
    expect(() => SiembraRetrasadaDtoSchema.parse({ partidaId: 1 })).toThrow();
  });
});

describe("FaltaGerminacionDtoSchema", () => {
  const valid = {
    partidaId: 1050,
    anio: 2026,
    indice: 1,
    codigoEspecie: "ROS01",
    nombreEspecie: "Rosa Hybrid Tea",
    injerto: "I002",
    nrocont: "104",
    fPrimer: "2026-07-01",
    pr: "0",
    commentCount: 0,
  };

  it("accepts valid falta germinacion", () => {
    const result = FaltaGerminacionDtoSchema.parse(valid);
    expect(result.pr).toBe("0");
    expect(result.fPrimer).toBe("2026-07-01");
  });

  it("rejects missing required fields", () => {
    const { pr, ...withoutPr } = valid;
    expect(() => FaltaGerminacionDtoSchema.parse(withoutPr)).toThrow();
  });
});

describe("FaltantePlantasDtoSchema", () => {
  const valid = {
    partidaId: 1048,
    anio: 2026,
    indice: 1,
    siembras: 3,
    codigoEspecie: "EUC01",
    nombreEspecie: "Eucalipto Grandis",
    nrocont: "500",
    solicito: 500,
    producido: 342,
    diferencia: -158,
    commentCount: 0,
  };

  it("accepts valid faltante plantas", () => {
    const result = FaltantePlantasDtoSchema.parse(valid);
    expect(result.solicito).toBe(500);
    expect(result.producido).toBe(342);
    expect(result.diferencia).toBe(-158);
    expect(result.siembras).toBe(3);
  });

  it("rejects missing required fields", () => {
    const { solicito, ...withoutSolicitadas } = valid;
    expect(() => FaltantePlantasDtoSchema.parse(withoutSolicitadas)).toThrow();
  });
});

describe("FaltaPreExpedicionDtoSchema", () => {
  const valid = {
    partidaId: 1052,
    anio: 2026,
    indice: 1,
    codigoEspecie: "LIM02",
    nombreEspecie: "Limonero Volkameriano",
    injerto: "I003",
    nrocont: "96",
    fPreexp: "2026-07-20",
    pe: 0,
    commentCount: 0,
  };

  it("accepts valid falta pre-expedicion", () => {
    const result = FaltaPreExpedicionDtoSchema.parse(valid);
    expect(result.fPreexp).toBe("2026-07-20");
    expect(result.pe).toBe(0);
  });

  it("rejects missing required fields", () => {
    const { fPreexp, ...withoutFecha } = valid;
    expect(() => FaltaPreExpedicionDtoSchema.parse(withoutFecha)).toThrow();
  });
});

describe("AlertCommentSchema", () => {
  const valid = {
    id: "clx1234567890abcdef123456",
    alertType: "SIEMBRA_RETRASADA",
    partidaId: 1045,
    anio: 2026,
    indice: 1,
    content: "Sembrada el lunes",
    userId: "clx1234567890abcdef123467",
    userName: "Juan Perez",
    createdAt: "2026-07-28T10:30:00.000Z",
  };

  it("accepts valid alert comment", () => {
    const result = AlertCommentSchema.parse(valid);
    expect(result.content).toBe("Sembrada el lunes");
    expect(result.userName).toBe("Juan Perez");
  });

  it("rejects missing required fields", () => {
    expect(() => AlertCommentSchema.parse({ partidaId: 1 })).toThrow();
  });
});

describe("CreateAlertCommentSchema", () => {
  it("accepts valid create comment", () => {
    const result = CreateAlertCommentSchema.parse({
      alertType: "SIEMBRA_RETRASADA",
      partidaId: 1045,
      anio: 2026,
      indice: 1,
      content: "Sembrada el lunes",
    });
    expect(result.alertType).toBe("SIEMBRA_RETRASADA");
  });

  it("rejects empty content", () => {
    expect(() =>
      CreateAlertCommentSchema.parse({
        alertType: "SIEMBRA_RETRASADA",
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        content: "",
      }),
    ).toThrow();
  });

  it("rejects content over 500 chars", () => {
    expect(() =>
      CreateAlertCommentSchema.parse({
        alertType: "SIEMBRA_RETRASADA",
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        content: "x".repeat(501),
      }),
    ).toThrow();
  });

  it("rejects invalid alertType", () => {
    expect(() =>
      CreateAlertCommentSchema.parse({
        alertType: "INVALID",
        partidaId: 1045,
        anio: 2026,
        indice: 1,
        content: "Test",
      }),
    ).toThrow();
  });
});
