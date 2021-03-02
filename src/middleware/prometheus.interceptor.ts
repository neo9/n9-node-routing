import { NextFunction, Request, Response } from 'express';
import * as PrometheusClient from 'prom-client';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'before' })
export class PrometheusInterceptor implements ExpressMiddlewareInterface {
	private httpRequestInFlightGauge: PrometheusClient.Gauge<string>;

	constructor() {
		this.httpRequestInFlightGauge = new PrometheusClient.Gauge({
			name: 'http_request_in_flight_total',
			help: 'A gauge of requests currently being served by the app',
			labelNames: ['method'],
		});
	}

	public use(request: Request, response: Response, next: NextFunction): void {
		this.httpRequestInFlightGauge.labels(request.method).inc(1);
		response.on('finish', () => {
			this.httpRequestInFlightGauge.labels(request.method).dec(1);
		});
		next();
	}
}
