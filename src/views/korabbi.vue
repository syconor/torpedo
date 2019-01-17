<template>
  <div id="app">
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
                  v-html="cell"
                  ></td>
              </tr>
            </table>
          </div>
          <div id="felirat">
            <h1 style="color:blue">Torpedó</h1>
            <b-btn @click="send('olvas','olvas')"
                  v-if="gl" 
                    >Játékok lekérdezése</b-btn>
            <div id="adat_mezo" 
                v-if="jgl" 
                v-for="(v,k) in vja" 
                :key="k" >
                  {{v[1]}}
                  <b-button 
                      @click="lekerdez(v[0])">lekér
                  </b-button>
            </div>
            <div id="ljs"
                v-if="!jgl" >
              <b-button @click='indit()'
                >Lejátszás indítása
              </b-button>
              <b-button @click='ujra()'
                        v-if="ug"
                 >Újra
              </b-button>
              <hr>
              <b-input
                v-model.number="seb"
                type= "range"
                min = "1"
                max = "20" />
              <span>Lejátszás sebessége:{{seb}}</span>  
              <hr>
                <b-button @click="leptet()"
                  >Léptetés Kattintásra
                </b-button> 
            </div>
            <div v-if="!jgl">
              <hr>
              <b-button @click="rs()"
              >Új játék beolvasása</b-button> 
            </div>
          </div>
          <div class="nagy" >
            <h3>Ellenfél táblája</h3>
            <table id="tabla2" class="t1" @click.right.stop.prevent>
              <tr v-for = "(row,d) in table2">
                <td  v-for = "(cell,c) in row"
                  :id="'cell2'+d+'-'+c"
                  v-html="cell"
                  ></td>
              </tr>
            </table>
          </div>
      </div>
      <hr>
      <hr>
    </div>
  </div>
</template>

<script>
const client_id=Math.round(Math.random()*1000000)*11
const socket = new WebSocket('ws:localhost:3000',"echo-protocol")
export default {
  name: 'app',
 
  data() {

    return {
      al:false,
      ug:false,
      seb:10,
      kl:0,
      gl : true,
      jgl : true,
      table1: [],
      table2: [],
      ellentable: [],
      et1: [],
      et2:[],
      message: '',
      adat: [],
      xy: [],
      azon: [],
      cont: 0,
      id: 0,
      szh: 0,
      vja : [],
      jatek: {
        id: 0,
        j_id1: 0,
        j_id2: 0,
        lepesek: [],
        ido: 0
      }      
    }
  },

  computed: {
        keses(){
          return this.seb*100
        }
  },

  mounted() {
    this.createtable()
      
    socket.addEventListener( 'message', event => {
        this.adat.push(event.data.split(':'))
        this.azon.push(this.adat[0][0].split(','))
        this.id=Number(this.azon[0])
        this.xy.push(this.adat[0][1].split(';'))
        this.x=this.xy[0][0]
        this.y=this.xy[0][1]
        console.log("Érkezett:"+this.id,this.x,)
        
        if (this.id==client_id ) {
          if (this.x=='adatok') {
            this.vja=this.y.split('#')
                            .map(v=>v.split('|'))
                                    
            this.vja.map(v=>v[1]=new Date(Number(v[1])).toLocaleDateString('hu-HU'))
            this.gl=false
          }
          if (this.x=='jatek'){
            let valasz = JSON.parse(window.atob(this.y))
            this.jatek.id=valasz[0]._id
            this.jatek.j_id1=Number(valasz[0].j_id1)
            this.jatek.j_id2=Number(valasz[0].j_id2)
            this.jatek.lepesek=valasz[0].lepesek
            this.jatek.ido=Number(valasz[0].ido)

            this.et1.push(valasz[0].tabla1.split(','))
            this.et2.push(valasz[0].tabla2.split(','))

            this.tablaGeneral()
          }                              
        }
        this.azon=[]
        this.id=0
        this.adat=[]
        this.xy=[]}
    )
  },
 
  methods: {
    jatekot_Lekerdez() {
        this.send('olvas','olvas')
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

    click2(x,y) {
        console.log('löves 1')
        
        if ( this.table1[y][x]==' ' ) {
            this.$set(this.table1[y], x, 'Ü')
            document.getElementById('cell'+y+'-'+x).style.background='grey'
         }
        else {
            this.$set(this.table1[y], x, 'X')
            document.getElementById('cell'+y+'-'+x).style.background='red'
        }
      },
    click1(x,y) {
      console.log('löves 2')
        
        if ( this.table2[y][x]==' ' ) {
            this.$set(this.table2[y], x, 'Ü')
            document.getElementById('cell2'+y+'-'+x).style.background='grey'
            this.mezo="Az ellenfél lövése nem talált."
            this.mezo2="Te következel."
         }
        else {
            this.$set(this.table2[y], x, 'X')
            document.getElementById('cell2'+y+'-'+x).style.background='red'
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
        console.log("Elküldve: "+client_id,cox,coy)
        this.message=''
    },

    tablaGeneral() {
        
                for (let i=0;i<10;i++){
                    for (let j=0;j<10;j++){
                      let w=((i*10)+j)
                      if (this.table1[i][j]=='Ü'){
                        this.table1[i][j]=' '
                        document.getElementById('cell'+i+'-'+j).style.background='white'
                      }
                      this.table1[i][j]=this.et1[0][w] 
                      if (this.table1[i][j]!=' '){
                        document.getElementById('cell'+i+'-'+j).style.background='blue'
                      } 
                      if (this.table2[i][j]=='Ü'){
                        this.table2[i][j]=' '
                        document.getElementById('cell2'+i+'-'+j).style.background='white'
                      } 
                      this.table2[i][j]=this.et2[0][w]
                      if (this.table2[i][j]!=' '){
                        document.getElementById('cell2'+i+'-'+j).style.background='cyan'
                      } 
                    }
                }
        this.jgl= false 
    },

    indit(){
      this.al=true
      this.lejatszas()
    },

    leptet(){
      this.al=false
      this.lejatszas()
    },

    ujra() {
      this.kl=0
      this.tablaGeneral()
      this.lejatszas()
    },

    lejatszas(){
      if (this.kl<=(this.jatek.lepesek).length-1) {

        let j_adat = this.jatek.lepesek[this.kl].split(':') 
        let j_azon = Number(j_adat[0])
        let j_xy = j_adat[1].split(';')
        let j_x = Number(j_xy[0])
        let j_y = Number(j_xy[1])
        console.log(j_azon,this.jatek.j_id1,this.jatek.j_id2)
        
        if (j_azon==this.jatek.j_id1) {
          this.kl++ 
          this.click1(j_x,j_y)
        }
        if (j_azon==this.jatek.j_id2) {
          this.kl++ 
          this.click2(j_x,j_y)
        }
      }  
      if (this.kl>(this.jatek.lepesek).length-1) {
        this.ug=true
      }
      if (this.al==true){
        setTimeout(() => {
            this.lejatszas()
          }, this.keses)
      }    
    },

    lekerdez(x){
      socket.send( JSON.stringify({
            id:     client_id,
            msg: "lekerdez;"+x
          })
        )
    },

    rs() {
      location.reload()
    }
  },

  watch: {
    
 }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Poppins:500&subset=latin-ext');

html {
  font-family: 'Poppins', sans-serif;
  background-image: url('/../assets/kep3.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

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

#tabla2 {
  color: cyan !important;
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


</style>