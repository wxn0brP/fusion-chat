export default class ValidError {
    module;
    constructor(module) {
        this.module = module;
    }
    valid(...err) {
        return {
            err: ["error.valid", this.module, ...err]
        };
    }
    err(...err) {
        return {
            err: ["error", this.module, ...err]
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL2JhY2svbG9naWMvdmFsaWRFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFDM0IsTUFBTSxDQUFlO0lBRXJCLFlBQVksTUFBb0I7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFHLEdBQVU7UUFDZixPQUFPO1lBQ0gsR0FBRyxFQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUM7U0FDNUMsQ0FBQTtJQUNMLENBQUM7SUFFRCxHQUFHLENBQUMsR0FBRyxHQUFVO1FBQ2IsT0FBTztZQUNILEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDO1NBQ3RDLENBQUE7SUFDTCxDQUFDO0NBQ0oifQ==