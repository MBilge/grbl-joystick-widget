
#define PINX A0
#define PINY A1


// id for json
char id[] = "jog";



// default delay for sending messages
int d; 
int btn = 0;
int normalDelay = 250;
int sleepDelay = 5 * 1000; // send message every x seconds

// range for sensitivity
int range[] = {-18, 18};

int x;
int y;

// cycle trough analoRead
int c = 3;

// if in normal position use time counter 
// to increase delay between messages
unsigned long sleepTime;
unsigned long lastCommand;
unsigned long lastSent;
boolean sleeping;



void setup() {

 Serial.begin(115200);
 sleeping = true;
  
 
}

void loop() { 
  readInputs();
  checkInputs();


  Send();
}

void Send(){

   if (sleeping){
    //if (millis() - lastSent  > sleepDelay){
    //    sendJson();
    //    lastSent = millis();
    //} 
   
  }
  else{
    if (millis() - lastSent  > normalDelay){
      
     
       
      
          sendJson();
          lastSent = millis();
     
    }
  }
}
void checkInputs(){

 
  
  if (x == 0 && y == 0){
      // we are in stand-by mode
      // waiting x3 normalDelay before going in sleep mode
      if ( millis() - lastCommand  > normalDelay ){
         if (sleeping == false){
          delay(100);
          x=0;
          y=0;
          sendJson();
         }
         sleeping = true;
      }
  }
  else{
      // we are getting movements
      if (sleeping == true){
          delay(10);
          readInputs();
      }
      sleeping = false;
      lastCommand = millis();
  }
}

void readInputs(){

 
    
  x = analogRead(PINX);
  x = -(512 - x) / 2;
  
  
  y = analogRead(PINY); 
  y = (512 - y) / 2;


  if (x > range[0] && x < range[1]){
    x=0;
  }

  if (y > range[0] && y < range[1]){
    y=0;
  }
}

void sendJson(){

  
  
  
  // Serial.println( String("{\"Cmd\": \"Broadcast\", \"Msg\": {\"id\": ")+ String(id) + String(", \"x\": ") + String(x) + String(", \"y\": ")+ String(y) + String("}}"));  

  // Serial.println( String("broadcast {\"id\": ")+ String(id) + String(", \"x\": ") + String(x) + String(", \"y\": ")+ String(y) + String("}"));  

  // Serial.println( String("{\"id\": ")+ String(id) + String(", \"x\": ") + String(x) + String(", \"y\": ")+ String(y) + String("}"));  

  Serial.println("{x: "+ String(x) + ", y: "+ String(y) + "}");  
}
