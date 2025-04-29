import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SignatureResponse } from '../models/signature-response';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private telmedAPI: string = "https://telmed.paramedicapps.com.ar/apiDespacho/Encuesta/SaveImage";
  // private commonsAPI: string = "https://commons.shamanapps.com.ar/api/Signature/SetSignature";
  private commonsAPI: string = "https://localhost:44332/api/Signature/SetSignature";
  private licensesAPI: string = 'https://metrics.shamanapps.com.ar/license/api/v1/Serial'
  //private licensesAPI: string = "https://licenses.paramedic-pilar.com.ar/api/v1/Serial"

  constructor(private http: HttpClient) {}

  saveImageTelmed(serial: string, firmaId: number, firmaIm: string): Observable<any>{
    const getEncuestaUrl = this.telmedAPI;

    var bodyObj = {
        idEncuestaDetalleTipo: 8,
        carpeta: firmaId,
        valor: firmaIm
    }

    const body = JSON.stringify(bodyObj);
    const headerOptions = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(getEncuestaUrl, body, {headers: headerOptions});
  }

  setFirma(serial: string, id: string, firmaUrl: string): Observable<SignatureResponse> {
    const setEncuestaUrl = this.commonsAPI;

    let bodyObj = {
      Serial: serial,
      IncidenteId: id,
      Signature: firmaUrl
    };

    const body = JSON.stringify(bodyObj);
    const headerOptions = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<SignatureResponse>(setEncuestaUrl, body, {headers: headerOptions});
  }

  getRazonSocial(serial: string) {
    const licenseUrl = `${this.licensesAPI}/${serial}/Validation`
    return this.http.get<any>(licenseUrl);
  }

}
