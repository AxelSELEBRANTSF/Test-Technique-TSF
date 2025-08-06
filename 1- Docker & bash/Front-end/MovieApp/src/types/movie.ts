type DateType = {
    date: string,
    timezone: string,
    timezone_type: number
}

export type MovieType = {
    id: number,
    title: string,
    production: string,
    director?: string,
    start_date?: DateType,
    enddate?: DateType,
}
