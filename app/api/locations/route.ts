import locations from "@/data/brazil-locations.json";

type City = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type State = {
  code: number;
  abbreviation: string;
  name: string;
  latitude: number;
  longitude: number;
  cities: City[];
};

const brazilianStates = locations.states as State[];

export async function GET(request: Request) {
  const stateCode = new URL(request.url).searchParams
    .get("state")
    ?.trim()
    .toUpperCase();

  const headers = {
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
  };

  if (!stateCode) {
    return Response.json(
      {
        states: brazilianStates.map((state) => ({
          code: state.code,
          abbreviation: state.abbreviation,
          name: state.name,
          latitude: state.latitude,
          longitude: state.longitude,
        })),
      },
      { headers },
    );
  }

  if (!/^[A-Z]{2}$/.test(stateCode)) {
    return Response.json({ message: "Estado inválido." }, { status: 400 });
  }

  const state = brazilianStates.find(
    ({ abbreviation }) => abbreviation === stateCode,
  );

  if (!state) {
    return Response.json({ message: "Estado não encontrado." }, { status: 404 });
  }

  return Response.json(
    {
      state: {
        code: state.code,
        abbreviation: state.abbreviation,
        name: state.name,
        latitude: state.latitude,
        longitude: state.longitude,
      },
      cities: state.cities,
    },
    { headers },
  );
}
