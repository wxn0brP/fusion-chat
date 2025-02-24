export interface ApiServerParams {
    state: string;
    name: string;

    details?: string;
    logoName?: string;
    logoText?: string;
    startTime?: number;
    endTime?: number;
    party?: {
        id: string;
        state: number;
        max: number;
    }
}
