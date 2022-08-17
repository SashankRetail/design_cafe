import { DateTimeResolver } from 'graphql-scalars';
import { getCities, getCityById } from "./queries";
import { addCity, updateCity } from './mutations';

export const citiesResolver = {
  Query: {
    allCities: async () => getCities(),
    getCityById: async (parent, _args: { data: any }, context) => getCityById(parent, _args, context),
  },
  Mutation: {
    addCity: async (parent, _args: { data: any }, context) => addCity(parent, _args, context),
    updateCity: async (parent, _args: { data: any }, context) => updateCity(parent, _args, context),
  },
  DateTime: DateTimeResolver
}

