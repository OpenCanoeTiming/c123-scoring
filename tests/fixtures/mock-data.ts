// Mock data for visual tests

export const serverInfoMessage = {
  type: 'ServerInfo',
  data: {
    version: '1.0.0',
    c123Connected: true,
    c123Host: 'localhost',
  },
};

export const scheduleMessage = {
  type: 'Schedule',
  data: {
    races: [
      {
        raceId: 'race-1',
        raceOrder: 1,
        mainTitle: 'K1M Semi-final',
        raceStatus: 6, // InProgress
        nrCompetitors: 20,
        run: 1,
      },
      {
        raceId: 'race-2',
        raceOrder: 2,
        mainTitle: 'C1W Final',
        raceStatus: 4, // Ready
        nrCompetitors: 15,
        run: 1,
      },
      {
        raceId: 'race-3',
        raceOrder: 3,
        mainTitle: 'K1W Qualification',
        raceStatus: 5, // Started
        nrCompetitors: 30,
        run: 2,
      },
    ],
  },
};

export const raceConfigMessage = {
  type: 'RaceConfig',
  data: {
    raceId: 'race-1',
    nrGates: 18,
    gates: [
      { nr: 1, type: 'N', segment: 1 },
      { nr: 2, type: 'N', segment: 1 },
      { nr: 3, type: 'R', segment: 1 },
      { nr: 4, type: 'N', segment: 1 },
      { nr: 5, type: 'N', segment: 2 },
      { nr: 6, type: 'R', segment: 2 },
      { nr: 7, type: 'N', segment: 2 },
      { nr: 8, type: 'N', segment: 2 },
      { nr: 9, type: 'R', segment: 2 },
      { nr: 10, type: 'N', segment: 3 },
      { nr: 11, type: 'N', segment: 3 },
      { nr: 12, type: 'R', segment: 3 },
      { nr: 13, type: 'N', segment: 3 },
      { nr: 14, type: 'N', segment: 4 },
      { nr: 15, type: 'R', segment: 4 },
      { nr: 16, type: 'N', segment: 4 },
      { nr: 17, type: 'N', segment: 4 },
      { nr: 18, type: 'N', segment: 4 },
    ],
    segments: [
      { id: 1, name: 'Segment 1', gates: [1, 2, 3, 4] },
      { id: 2, name: 'Segment 2', gates: [5, 6, 7, 8, 9] },
      { id: 3, name: 'Segment 3', gates: [10, 11, 12, 13] },
      { id: 4, name: 'Segment 4', gates: [14, 15, 16, 17, 18] },
    ],
  },
};

export const onCourseMessage = {
  type: 'OnCourse',
  data: {
    raceId: 'race-1',
    competitors: [
      // Finished competitors (sorted by rank)
      {
        bib: '101',
        name: 'Jiri Prskavec',
        country: 'CZE',
        club: 'USK Praha',
        raceId: 'race-1',
        run: 1,
        completed: true,
        rank: 1,
        position: 0,
        time: '89.45',
        penalty: 0,
        total: '89.45',
        gates: '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
      },
      {
        bib: '105',
        name: 'Vit Prindis',
        country: 'CZE',
        club: 'Dukla',
        raceId: 'race-1',
        run: 1,
        completed: true,
        rank: 2,
        position: 0,
        time: '91.23',
        penalty: 2,
        total: '93.23',
        gates: '0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0',
      },
      {
        bib: '112',
        name: 'Jakub Grigar',
        country: 'SVK',
        club: 'Liptovsky Mikulas',
        raceId: 'race-1',
        run: 1,
        completed: true,
        rank: 3,
        position: 0,
        time: '90.87',
        penalty: 4,
        total: '94.87',
        gates: '0,2,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0',
      },
      {
        bib: '108',
        name: 'Giovanni De Gennaro',
        country: 'ITA',
        club: 'Canoa Club',
        raceId: 'race-1',
        run: 1,
        completed: true,
        rank: 4,
        position: 0,
        time: '92.56',
        penalty: 50,
        total: '142.56',
        gates: '0,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0',
      },
      {
        bib: '115',
        name: 'Benjamin Savsek',
        country: 'SLO',
        club: 'KKK Ljubljana',
        raceId: 'race-1',
        run: 1,
        completed: true,
        rank: 5,
        position: 0,
        time: '93.12',
        penalty: 2,
        total: '95.12',
        gates: '0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0',
      },
      // On course competitors (sorted by position)
      {
        bib: '118',
        name: 'Lukas Rohan',
        country: 'CZE',
        club: 'USK Praha',
        raceId: 'race-1',
        run: 1,
        completed: false,
        rank: 0,
        position: 1,
        time: '',
        penalty: 2,
        total: '',
        gates: '0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,,',
      },
      {
        bib: '122',
        name: 'Sideris Tasiadis',
        country: 'GER',
        club: 'Augsburg',
        raceId: 'race-1',
        run: 1,
        completed: false,
        rank: 0,
        position: 2,
        time: '',
        penalty: 0,
        total: '',
        gates: '0,0,0,0,0,0,0,0,0,0,,,,,,,',
      },
      {
        bib: '125',
        name: 'Martin Dougoud',
        country: 'SUI',
        club: 'Bern',
        raceId: 'race-1',
        run: 1,
        completed: false,
        rank: 0,
        position: 3,
        time: '',
        penalty: 0,
        total: '',
        gates: '0,0,0,0,0,,,,,,,,,,,,',
      },
    ],
  },
};

export const emptyScheduleMessage = {
  type: 'Schedule',
  data: {
    races: [],
  },
};

export const emptyOnCourseMessage = {
  type: 'OnCourse',
  data: {
    raceId: 'race-1',
    competitors: [],
  },
};
