import { Component, OnInit, ViewChild, HostListener, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SignatureService } from 'src/app/services/signature.service';
import { SignatureResponse } from 'src/app/models/signature-response';

@Component({
    selector: 'app-signature',
    templateUrl: './signature.component.html',
    styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements AfterViewInit, OnInit {
    // Parámetros para obtener los datos de la encuesta
    currentPage: boolean = true;
    formSubmitted: boolean = false;
    serial!: string;
    cliente!: string;
    afiliado!: string;
    paciente!: string;
    medico!: string;
    fecha!: string;
    diagnostico!: string;
    firma!: string;
    incidenteId!: string;
    
    private _canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;
    private paint!: boolean;

    private clickX: number[] = [];
    private clickY: number[] = [];
    private clickDrag: boolean[] = [];

    isDrawed: boolean = false;

    encuestaId: number = 0;
    nombreEncuesta: string = "Shaman - Firma";
    connectionString: string = "";

    encuestaForm: FormGroup = new FormGroup({});
    image: any;

    // @HostListener('document:mousedown', ['$event'])
    // pressMouseEventHandler(event: MouseEvent) {
    //     this.pressEventHandler(event);
    // }

    // @HostListener('document:touchstart', ['$event'])
    // pressTouchEventHandler(event: TouchEvent) {
    //     this.pressEventHandler(event);
    // }

    // @HostListener('document:mousemove', ['$event'])
    // mouseDragEventHandler(event: MouseEvent) {
    //     event.preventDefault();
    //     this.dragEventHandler(event);
    // }

    // @HostListener('document:touchmove', ['$event'])
    // touchDragEventHandler(event: TouchEvent) {
    //     event.preventDefault();
    //     this.dragEventHandler(event);
    // }

    // @HostListener('document:mouseup', ['$event'])
    // mouseReleaseEventHandler(event: MouseEvent) {
    //     event.preventDefault();
    //     this.releaseEventHandler();
    // }

    // @HostListener('document:touchend', ['$event'])
    // touchReleaseEventHandler(event: TouchEvent) {
    //     event.preventDefault();
    //     this.releaseEventHandler();
    // }

    // @HostListener('document:mouseout', ['$event'])
    // cancelMouseEventHandler() {
    //     this.cancelEventHandler();
    // }

    // @HostListener('document:touchcancel', ['$event'])
    // cancelTouchEventHandler() {
    //     this.cancelEventHandler();
    // }

    ngAfterViewInit(): void {
        let _canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
        let context = _canvas.getContext('2d');
        if(context){
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.strokeStyle = 'black';
            context.lineWidth = 1;
        
            this._canvas = _canvas;
            this.context = context;
        }

        this.activatedRoute.queryParams.subscribe((params: { [x: string]: { toString: () => string; }; }) => {
          this.serial = params['licencia'].toString() || '';
          this.cliente = params['cliente'].toString() || '';
          this.afiliado = params['afiliado'].toString() || '';
          this.paciente = params['paciente'].toString() || '';
          this.medico = params['medico'].toString() || '';
          this.fecha = params['fecha'].toString() || '';
          this.diagnostico = params['diagnostico'].toString() || '';
          this.incidenteId = params['incidenteViajeAtributoId'].toString() || '';
        });

        this.cdref.detectChanges();

        this.getRazonSocial();
        this.redraw();
        this.createUserEvents();
      }
      
      constructor(private activatedRoute: ActivatedRoute, private signatureService: SignatureService, private toastr: ToastrService, private cdref: ChangeDetectorRef) {
      }
      
    ngOnInit(): void {
      this.initListeners();
    }

    getRazonSocial(): void {
      this.signatureService.getRazonSocial(this.serial).subscribe((resp: any) => {
        this.nombreEncuesta = resp['razonSocial'];
      },
        (error: any) => {
        console.log(error);
      });
    }

    initListeners(): void {
        // document.addEventListener('mousedown', (e) => { e.preventDefault(),  this.pressEventHandler(e) });
        // document.addEventListener('touchstart', (e) => { e.preventDefault(),  this.pressEventHandler(e) }, { passive: false });
        // document.addEventListener('mousemove', (e) => { e.preventDefault(),  this.dragEventHandler(e) }, { passive: false });
        // document.addEventListener('touchmove', (e) => { e.preventDefault(),  this.dragEventHandler(e) }, { passive: false });
        // document.addEventListener('mouseup', (e) => { e.preventDefault(),  this.releaseEventHandler() }, { passive: false });
        // document.addEventListener('touchend', (e) => { e.preventDefault(),  this.releaseEventHandler() }, { passive: false });
        // document.addEventListener('mouseout', (e) => { e.preventDefault(),  this.cancelEventHandler() }, { passive: false });
        // document.addEventListener('touchcancel', (e) => { e.preventDefault(),  this.cancelEventHandler() }, { passive: false });
        
    }
    
    private createUserEvents() {
        document.getElementById('clear')?.addEventListener('click', (e) => { e.preventDefault(),  this.clearEventHandler() });
        document.getElementById('save')?.addEventListener('click', (e) => { e.preventDefault(),  this.saveCanvasImage() });
    }
    
    private redraw() {
        let clickX = this.clickX;
        let context = this.context;
        let clickDrag = this.clickDrag;
        let clickY = this.clickY;
        for (let i = 0; i < clickX.length; ++i) {
          context.beginPath();
          if (clickDrag[i] && i) {
            context.moveTo(clickX[i - 1], clickY[i - 1]);
          } else {
            context.moveTo(clickX[i] - 1, clickY[i]);
          }
    
          context.lineTo(clickX[i], clickY[i]);
          context.stroke();
        }
        context.closePath();
    }
    
    private addClick(x: number, y: number, dragging: boolean) {
        this.clickX.push(x);
        this.clickY.push(y);
        this.clickDrag.push(dragging);
    }
    
    private clearCanvas() {
        this.isDrawed = false;

        this.context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.clickX = [];
        this.clickY = [];
        this.clickDrag = [];
    }
    
    private clearEventHandler = () => {
        this.clearCanvas();
    };
    
    private releaseEventHandler = () => {
        this.paint = false;
        this.redraw();
    };
    
    cancelEventHandler = () => {
        this.paint = false;
    };
    
    private pressEventHandler(e: MouseEvent | TouchEvent) {
        let mouseX = (e as TouchEvent).changedTouches
          ? (e as TouchEvent).changedTouches[0].pageX
          : (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches
          ? (e as TouchEvent).changedTouches[0].pageY
          : (e as MouseEvent).pageY;
        mouseX -= this._canvas.offsetLeft;
        mouseY -= this._canvas.offsetTop;
    
        this.paint = true;
        this.addClick(mouseX, mouseY, false);
        this.redraw();
    }
    
    private dragEventHandler(e: MouseEvent | TouchEvent) {
        let mouseX = (e as TouchEvent).changedTouches
          ? (e as TouchEvent).changedTouches[0].pageX
          : (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches
          ? (e as TouchEvent).changedTouches[0].pageY
          : (e as MouseEvent).pageY;
        mouseX -= this._canvas.offsetLeft;
        mouseY -= this._canvas.offsetTop;
    
        if (this.paint) {
          this.addClick(mouseX, mouseY, true);
          this.redraw();
        }
    
        e.preventDefault();
    }

    saveCanvasImage() {
        //Si this.isDrawed != true nunca se firmó, 
        //por lo que no devolvemos imagen que tenía o "" así puede validar si es un requerido completo o no
        if (this.isDrawed != true) {
          //this.viewCtrl.dismiss("");
          return;
        }
        
        var dataUrl = this._canvas.toDataURL();
        
        //this.viewCtrl.dismiss(dataUrl);
        this.signatureService.setFirma(this.serial, this.incidenteId, dataUrl).subscribe((resp: SignatureResponse) => {
          if(resp.resultado != 1){
            // toast error
            this.toastr.error("Error al guardar firma", "Error");
          } else {
            // toast exito
            this.toastr.success("Firma registrada con éxito", "Success");
            this.currentPage = false;
            this.formSubmitted = true;
          }
        },
          (error: any) => {
            console.log(error);
        });
    }

    startDrawing(e: MouseEvent | TouchEvent) {
      this.isDrawed = true;
    
      let mouseX = (e as TouchEvent).changedTouches
        ? (e as TouchEvent).changedTouches[0].pageX
        : (e as MouseEvent).pageX;
      let mouseY = (e as TouchEvent).changedTouches
        ? (e as TouchEvent).changedTouches[0].pageY
        : (e as MouseEvent).pageY;
      mouseX -= this._canvas.offsetLeft;
      mouseY -= this._canvas.offsetTop;
    
      this.paint = true;
      this.addClick(mouseX, mouseY, false);
      this.redraw();
    }

    moved(e: MouseEvent | TouchEvent) {
        if (this.image) {
          return;      
        }
    
        var canvasPosition = this._canvas.getBoundingClientRect();
    
        let ctx = this._canvas.getContext('2d');
        let mouseX = (e as TouchEvent).changedTouches
          ? (e as TouchEvent).changedTouches[0].pageX
          : (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches
          ? (e as TouchEvent).changedTouches[0].pageY
          : (e as MouseEvent).pageY;
        mouseX -= this._canvas.offsetLeft;
        mouseY -= this._canvas.offsetTop;
    
        if (this.paint) {
          this.addClick(mouseX, mouseY, true);
          this.redraw();
        }
    
        if(ctx){
            ctx.beginPath();
            ctx.lineJoin = "miter";
            ctx.closePath();
            ctx.stroke();
        }

        e.preventDefault();
    }
}