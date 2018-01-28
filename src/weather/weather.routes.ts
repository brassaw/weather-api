import { ReplyNoContinue, Request, RouteConfiguration } from 'hapi';
import { promisify } from 'util';
import moment = require('moment');

type WeatherRecord = {
  date: string;
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  rainfall: number;
};

type WeatherData = { [time: string] : WeatherRecord };

type DaysWeather = {
  id: string;
  data: WeatherData;
};

type LoadFunction = (date: string) => Promise<DaysWeather>;
type SaveFunction = (daysWeather: DaysWeather) => Promise<void>;
type ListFunction = () => Promise<DaysWeather[]>;

const store = require('json-fs-store')('./data');

const load = promisify<LoadFunction>(store.load);
const save = promisify<SaveFunction>(store.add);
const list = promisify<ListFunction>(store.list);

export const routes: RouteConfiguration[] = [
  {
    method: 'GET',
    path: '/',
    handler: function (_request: Request, reply: ReplyNoContinue) {
      list().then((allData: DaysWeather[]) => {
        reply(JSON.stringify(allData));
      });
    }
  },
  {
    method: 'GET',
    path: '/{date}',
    handler: function (request: Request, reply: ReplyNoContinue) {
      loadDay(request.params.date).then((daysData: object) => {
        reply(JSON.stringify(daysData));
      });
    }
  },
  {
    method: 'POST',
    path: '/add',
    handler: function (request: Request, reply: ReplyNoContinue) {
      console.error(`payload: ${request.payload}`);
      const newData: WeatherRecord[] = JSON.parse(request.payload);
      // Since the data could come in a block that crosses a day boundary, load
      // and save each item sequentially. Storing these entries locally until
      // the whole dataset has been processed and then saving the resulting
      // object(s) might prevent several `save` calls.
      let promise = Promise.resolve();
      newData.forEach((record: WeatherRecord) => {
        promise = promise.then(() => {
          return loadDay(record.date).then((daysWeather: DaysWeather) => {
            daysWeather.data[record.time] = record;
            return save(daysWeather);
          });
        });
      });

      promise.then(() => {
        reply({
          status: 'saved',
          numRecords: newData.length
        });
      });
    }
  }
];

function loadDay(date: string): Promise<DaysWeather> {
  const dateString = moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  return load(dateString).catch(() => {
    return Promise.resolve({
      id: dateString,
      data: {}
    });
  });
}
