interface Party {
    id: string;
    state: number;
    max: number;
}

interface Status {
    state: string;
    name: string;
    details?: string;
    logoName?: string;
    logoText?: string;
    startTime?: number;
    endTime?: number;
    party?: Party;
}

export default Status;
