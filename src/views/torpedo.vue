<template>

 <div id="app">
   <hr>
  <h1 id="mezo">{{mezo}}</h1>
  <h1 id="mezo2">{{mezo2}}</h1>
  <hr>
  <hr>
  <div>
    <div id="tablak">
        <div class="nagy" >
          <h3 id="ez">Saját tábla</h3>
          <table id="tabla1" class="t1" >
            <tr v-for = "(row,b) in table1">
              <td v-for = "(cell,a) in row"
                :id="'cell'+b+'-'+a"
                @click.left = "tclick1(a,b,hv)"
                @click.right.stop.prevent = "fordit(a,b,hv)"
                @mouseover="vizsgal(a,b,hv)"
                @mouseout='vissza(a,b,hv)'
                v-html="cell"
                ></td>
            </tr>
          </table>
        </div>
        <div id="felirat"><h1 style="color:blue">Torpedó</h1>
          <b-btn id="indgomb" @click="indul(sz1)"
                              v-if="ji">Játék indítása</b-btn>
          <b-btn id="rs" @click="rs()">Szerver restart</b-btn>
          <b-btn id="idl" @click="id_leker()"
                          v-if="!ji">Azonosító kérése</b-btn>
        </div>
        <div class="nagy" id="tabla2">
           <h3>Ellenfél táblája</h3>
          <table class="t1" @click.right.stop.prevent>
            <tr v-for = "(row,d) in table2">
              <td  v-for = "(cell,c) in row"
                :id="'cell2'+d+'-'+c"
                @click = "tclick2(c,d)"
                v-html="cell"
                ></td>
            </tr>
          </table>
        </div>
    </div>
    <hr>
    <hr>
  </div>
  <div id="gombsor">
         <b-form-group id="gombok" >
           <b-form-radio-group id="radio" 
                               v-model="select" 
                               name="radioSubComponent">
             <b-form-radio value="allo">Álló</b-form-radio>
             <b-form-radio value="fekvo">Fekvő</b-form-radio>
           </b-form-radio-group>
         </b-form-group>
         <b-form-group>
           <b-form-radio-group id="hajok"
                          buttons
                          button-variant="outline-primary"
                          size="lg"
                          v-model="selectHajo"
                          :options="options"
                          name="radioBtnOutline" />
         </b-form-group>
       </div>
  </div>
</template>

<script>
var socket = new WebSocket('ws:localhost:3000',"echo-protocol")
var cim =''
var client_id=Math.round(Math.random()*1000000)*11
/*
var config = new Promise(  (resolve,reject)=> {
  if ( cim==''){
    cim = window.prompt('A ws szerver címe:')
  }
  resolve( socket = new WebSocket('ws:'+cim,"echo-protocol"))
})
*/  

export default {
  name: 'app',
  data: {
    fekvo: "none",
    allo: "none",
  },
  data() {

    return {
      ji:false,
      select: 'allo',
      selectHajo: {1 : 1},
      options: [
        { text: 'Hajó 1', value: {1 : 1}, disabled: false },
        { text: 'Hajó 2', value: {2 : 2}, disabled: false },
        { text: 'Hajó 3', value: {3 : 2}, disabled: false },
        { text: 'Hajó 4', value: {4 : 3}, disabled: false },
        { text: 'Hajó 5', value: {5 : 3}, disabled: false },
        { text: 'Hajó 6', value: {6 : 4}, disabled: false },
        { text: 'Hajó 7', value: {7 : 5}, disabled: false },
      ],
      table1: [],
      table2: [],
      ellentable: [],
      et: [],
      sz1: 0,
      sz2: 1,
      message: '',
      adat: [],
      xy: [],
      azon: [],
      inds: false,
      inde: false,
      cont: 0,
      mezo: "A játék megkezdéséhez kérj azonosítót!",
      mezo2:"Torpedó made by Jack!",
      id: 0,
      hajoLetesz: false,
      szh: 0,
      ellen_id:0,
    }
  },

  computed: {
        hk(){
          
          return Object.keys(this.selectHajo)[0]
        },
        hv(){
           
          return this.selectHajo[this.hk]          
        },
        
  },

  mounted() {    
    this.createtable()
    socket.addEventListener( 'message', event => {
        this.adat.push(event.data.split(':'))
        this.azon.push(this.adat[0][0].split(','))
        this.id=Number(this.azon[0])
        this.xy.push(this.adat[0][1].split(';'))
        this.x=Number(this.xy[0][0])
        this.y=Number(this.xy[0][1])
        console.log("Érkezett:"+this.id,this.x,this.y)
        if (this.xy[0][0]==30) {
                      alert ("A szerver újraindult!")
                      location.reload()
              }
        if (this.id==client_id){
          if (this.x==80){
            if(confirm('A szerveren minden játékos id foglalt!\nAz ok-ra kattintva új játék indul a szerveren!')) {
                this.rs()
            }
            else {
              alert('Nem akarsz játszani??????')
              this.id_leker()
            }
          }
          if (this.x==40){
            this.ellen_id=this.y
            this.mezo='Az ellenfél megérkezett, kezdődhet a játék!'
            this.mezo2= 'Helyezd el a hajókat!'
          }
        } 
         if (this.id==this.ellen_id) {
              if (this.x==50 && this.y==50) {
                this.mezo="Te kezdesz."
                this.mezo2="Torpedó made by Jack!"
                this.inds= true
                this.inde = true
              }
              else if (this.x==51 && this.y==51) {
                this.mezo="Az ellenfél kezd."
                this.inds= false
                this.inde = true
              }
              else if  (this.x==20 && this.y==20) {
                  alert ("Vége a játéknak! Az ellenfél győzött!\nAz ok-ra kattintva új játék indul.")
                  location.reload()
              }
              else if  (this.x==25 && this.y==25) {
                    this.et.push(this.xy[0][2].split(','))
                    for (let i=0;i<10;i++){
                        for (let j=0;j<10;j++){
                          let w=((i*10)+j)
                          this.ellentable[j][i]=this.et[0][w]
                          }
                    }
                    this.mezo = "Az ellenfél elhelyzte a hajóit!"

              }
              else if (this.x<11 && this.y<11) {
                      this.eclick(this.x,this.y)
              }
              else if (this.x==40) {
                this.mezo='Az ellenfél készenáll, kezdődhet a játék!'
                this.mezo2= 'Helyezd el a hajókat!'
              }
              else {
                alert ("Hibás koordináták érkeztek!")
              }
            
        }
        this.azon=[]
        this.id=0
        this.adat=[]
        this.xy=[]}
    )
  },

  methods: {
    id_leker () {
        if (confirm("ID lekérése a szerverről")) {
            this.send('idt','leker')
        } else {
            alert('Nem tudsz ID nélkül játszani!')
            this.id_leker()
        }
        this.mezo='Várakozás az ellenfél megérkezésére...'
        this.ji=true
    },

    createtable() {
          this.table1=[]
          for (let i=0;i<10;i++) {
              let sor = []
              for (let j=0;j<10;j++) sor.push(' ')
              this.table1.push(sor)
          }
          this.table2=[]
          for (let i=0;i<10;i++) {
              let sor = []
              for (let j=0;j<10;j++) sor.push(' ')
              this.table2.push(sor)
          }

          this.ellentable=[]
          for (let i=0;i<10;i++) {
              let sor = []
              for (let j=0;j<10;j++) sor.push(' ')
              this.ellentable.push(sor)
          }
      },

    tclick1(x,y,z) {
      if (this.sz1==20 && !this.inds) {
                this.mezo="Hajók elhelyezve."
                this.mezo2="Kezdéshez kattints a játék indítására!"
      }
      else {
          if ( this.table1[y][x]!=' ' && !this.inds ) {
                      this.torol(x,y)
              }
          else if (this.hajoLetesz  && !this.inds ) {
                if (this.options[this.hk-1].disabled==false){
                  if (this.select=='allo'){
                      for (var i=0;i<z;i++){
                        
                          this.$set(this.table1[y+i], x, 'H'+this.hk)
                          document.getElementById('cell'+(y+i)+'-'+x).style.background='blue'
                          this.options[this.hk-1].disabled=true
                      }
                      this.sz1+=this.hv
                  }
                  else {
                    for (var i=0;i<z;i++){
                      
                            this.$set(this.table1[y], x+i, 'H'+this.hk)
                            document.getElementById('cell'+y+'-'+(x+i)).style.background='blue'
                            this.options[this.hk-1].disabled=true
                    }
                    this.sz1+=this.hv
                  }    
                }
          }
          if (this.sz1==20) {
                this.mezo="Hajók elhelyezve."
                this.mezo2="Kezdéshez kattints a játék indítására!"
      }
             
          if (this.inds) {
                this.mezo="A saját tábládra nem lőhetsz!"
                this.mezo2="Kattints a másik táblára!"
          }
        this.beas()  
      }
    },

    beas(){
      let esz = 0
      this.options.forEach((v,k)=>{
          if (esz==0){
            if (!v.disabled){
              this.selectHajo=v.value
              esz++              
            }
          }  
      })
    },

    torol(x,y){
      let jel= this.table1[y][x]
      this.$set(this.table1[y], x, ' ')
      document.getElementById('cell'+y+'-'+x).style.background='#effafc'
      this.sz1--
        for (var i=-1;i<2;i++) {
            for (var j=-1;j<2;j++) {
                if ((y+i>=0 && y+i<=9) && (x+j>=0 && x+j<=9)) {
                  if (this.table1[y+i][x+j]==jel){
                    this.torol(x+j,y+i)
                  }  
                }
           }
          }  
      this.options[Number(jel[1])-1].disabled=false     
    },

    tclick2(x,y) {
      if (this.inds==true && this.inde==true) {
        if ( this.table2[y][x]!=' ' ){
          this.mezo="Ebbe a mezőbe már lőttél!"
          this.mezo2="Válassz másikat!"
        }
        else {
            if ( this.ellentable[x][y]==' ' )
              {
                this.$set(this.table2[y], x, 'Ü')
                document.getElementById('cell2'+y+'-'+x).style.background='grey'
                this.mezo="Nem talált"
                this.mezo2="Az ellenfél következik."
              }
            if ( this.ellentable[x][y]!=' ' ) {
                this.$set(this.table2[y], x, 'T')
                document.getElementById('cell2'+y+'-'+x).style.background='red'
                this.mezo="Talált"
                this.mezo2="Az ellenfél következik."
                this.cont++
            }
            else {
                this.mezo="Ez még nem a Te köröd, kérlek várj!"
                this.mezo2="Torpedó made by Jack!"
            }
            this.send(x,y)
            if (this.cont==20) {
                this.send(20,20)
                this.send(30,'restart')
                alert("Gratulálok nyertél\naz ok-ra kattintva új játék indul!")
                location.reload()
            }
        }
      }
      if (this.inds==false && this.inde==false) {
        this.mezo="Először helyezd el a hajókat a saját tábládon!"
        this.mezo2="Torpedó made by Jack!"
      }
      
    },

    eclick(x,y) {
        console.log('Az ellenfél lövése: ',x,y)
        this.inds=true
        if ( this.table1[y][x]==' ' ) {
            this.$set(this.table1[y], x, 'Ü')
            document.getElementById('cell'+y+'-'+x).style.background='grey'
            this.mezo="Az ellenfél lövése nem talált."
            this.mezo2="Te következel."
         }
        else {
            this.$set(this.table1[y], x, 'X')
            document.getElementById('cell'+y+'-'+x).style.background='red'
            this.mezo="Az ellenfél lövése talált."
            this.mezo2="Te következel."
        }
      },

    send(cox,coy) {
        socket.send( JSON.stringify({
            id:     client_id,
            msg: cox+';'+coy
          })
        )
        this.inds=false
        console.log("Elküldve: "+cox,coy)
        this.message=''
    },

    sendtabla(cox,coy,tabla) {
      console.log(this.ellen_id)      
        if (this.ellen_id!=0) {
            socket.send( JSON.stringify({
                id:     client_id,
                msg: cox+';'+coy+';'+tabla
              })
            )
            console.log("Elküldve: "+cox,coy,)
            this.inds=true
            document.getElementById("indgomb").style.display = "none"
            this.message=''
        }
        else {
          this.mezo='Nincs még ellenfeled.'
          this.mezo2='Kérlek várj!'
        }
    },

    indul(e){
      if (e==20) {
          this.mezo2= "Várokozás az ellenfélre."
          this.sendtabla(25,25,this.table1)
      }
      else { this.mezo ="Még nem helyeztél el elég hajót!" }
    },

    rs(){
      this.send(30,'restart')
      this.ji=false
    },

    vizsgal(x,y,z) {
      if (!this.inds) {
        this.hajoLetesz=false
        if (this.select=='allo'){
              this.szh=0
              for (var i=0;i<z;i++){
                if (y-1<=9-z) {
                  if(this.table1[y+i][x]!=' '){
                    this.szh++
                  }
                }  
              }
              if (this.szh==0) {
                for (var i=0;i<z;i++){
                  if (y-1<=9-z) {
                  document.getElementById('cell'+(y+i)+'-'+x).style.border='3px solid green'
                  this.hajoLetesz=true
                  }
                }
              }
              else {
                for (var i=0;i<z;i++){
                  if (y-1<=9-z) {
                  document.getElementById('cell'+(y+i)+'-'+x).style.border='3px solid red'
                  }
                }
              }
        }
        else {
              this.szh=0
              for (var i=0;i<z;i++){
                if (x-1<=9-z) {
                  if(this.table1[y][x+i]!=' '){
                    this.szh++
                  }
                }
              }
              if (this.szh==0) {
                for (var i=0;i<z;i++){
                  if (x-1<=9-z) {
                  document.getElementById('cell'+y+'-'+(x+i)).style.border='3px solid green'
                  this.hajoLetesz=true
                  }
                }
              }
              else {
                for (var i=0;i<z;i++){
                  if (x-1<=9-z) {
                  document.getElementById('cell'+y+'-'+(x+i)).style.border='3px solid red'
                  }
                }
              }
        }
      }  
    },

    vissza(x,y,z){
          if (this.select=='allo'){
                  for (var i=0;i<z;i++){
                    if (y-1<=9-z) {
                    document.getElementById('cell'+(y+i)+'-'+x).style.border='3px solid transparent'
                    }
                  }
          }
          else {
                  for (var i=0;i<z;i++){
                    if (x-1<=9-z) {
                    document.getElementById('cell'+y+'-'+(x+i)).style.border='3px solid transparent'
                    }
                  }
                }
    },

    fordit(x,y){
      console.log('fordítás');
      if (this.select=="allo"){
        this.vissza(x,y,this.hv)
        this.select="fekvo"
        this.vizsgal(x,y,this.hv)
      }
      else{
        this.vissza(x,y,this.hv)
        this.select="allo"
        this.vizsgal(x,y,this.hv)
      }
    }
  },

  watch: {
    select: function(){
                if (this.select=='allo') {
                  this.allo=""
                  this.fekvo="none"
                }
                else {
                  this.allo="none"
                  this.fekvo=""
                }
            },
  }
 }

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Poppins:500&subset=latin-ext');

html {
  font-family: 'Poppins', sans-serif;
}
.cx {
  margin-left:10px;
  margin-right: 20px;
}
#app {
  margin: 10px;
  text-align: center;
  
}
h3 {
  font-size: 30px;
  color: LightSeaGreen;
  text-align: center;

}

#tablak {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.nagy {
  flex-grow: 2;
  align-items: center;

}
#felirat {
  flex-grow: 1;
  align-items: center;
  align-self: center;
}
.nagy td {
  color: blue ;
}
#tabla2 {
  color: cyan !important;
}
#tabla2 td:hover{
  background: #40e0d0 !important;
}
#mezo {
  color: green;
}
#mezo2 {
  color: LimeGreen;
}

#felirat {
    margin: 10px;
}
#gombsor{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
#gombok{
  align-items: center;
  display: flex;
  width: 75px;
  height: 75px;
}

#hajok {
  align-items: center;
  height: 75px;
  display: flex;
}
b-form-radio {
  padding: 20px;
}
td {
  width:30px;
  height:30px;
  box-shadow: 1px 1px 4px #000;
  border-radius: 4px;
  text-align: center;
  cursor:pointer;
  background-color: #effafc;
  border: 3px solid transparent;
}

.t1 {
   margin: 0 auto;
   border-spacing: 5px;
   border-collapse: separate;
   color: blue;
}

#rs {
  visibility: hidden;
}
</style>
