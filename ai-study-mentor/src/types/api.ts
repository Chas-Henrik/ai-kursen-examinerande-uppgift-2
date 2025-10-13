type ApiOK = { ok: true; data?: object | object[] | undefined };
type ApiErr = { ok: false; message: string; error?: string | undefined };

export type ApiResponseType = ApiOK | ApiErr;