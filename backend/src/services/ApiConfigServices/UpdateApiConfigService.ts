import AppError from "../../errors/AppError";
import ApiConfig from "../../models/ApiConfig";

interface ApiData {
  name: string;
  sessionId: string | number;
  urlDelivery?: string;
  urlServiceStatus?: string;
  urlMessageStatus?: string;
  userId: string | number;
  tenantId: string | number;
  isActive?: boolean;
}

interface Request {
  apiData: ApiData;
  apiId: string;
  tenantId: string | number;
}

const UpdateApiConfigService = async ({
  apiData,
  apiId,
  tenantId
}: Request): Promise<ApiConfig> => {
  const api = await ApiConfig.findOne({
    where: { id: apiId, tenantId }
  });

  if (!api) {
    throw new AppError("ERR_API_CONFIG_NOT_FOUND", 404);
  }

  const {
    name,
    sessionId,
    urlDelivery,
    urlServiceStatus,
    urlMessageStatus,
    userId,
    isActive
  } = apiData;

  await api.update({
    name,
    sessionId,
    urlDelivery,
    urlServiceStatus,
    urlMessageStatus,
    userId,
    isActive
  });

  await api.reload();

  return api;
};

export default UpdateApiConfigService;
