
#define PINY A0
#define PINX A1


// id for json
char id[] = "jog";

// default delay for sending messages
int d; 
int btn = 0;
int normalDelay = 200; // send jog position every x milliseconds
int sleepDelay = 0.5 * 1000; // send x=0 y=0 message every x seconds
int deepSleepDelay = 10 * 1000; // stop sending 

// range for sensitivity
int range[] = {-16, 16};

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
  checkSend();
}

void checkSend(){

  if (!sleeping){
    if (millis() - lastSent  > normalDelay){
          sendSerial();
          lastSent = millis();   
    }
  }
}

void checkInputs(){
  
  if (x == 0 && y == 0){
      // we are in stand-by mode
      // waiting normalDelay before going in sleep mode
      if (sleeping == false){
          delay(50);
          sendSerial();
         
     }

     if (millis() - lastSent > deepSleepDelay){

          // do not send
          
     }
     else if ( millis() - lastCommand  > sleepDelay ){
         

          sendSerial();
          lastCommand = millis();
        
    }
    sleeping = true;   
  }
  else{
      // we are getting movements
      if (sleeping == true){
          // delay to avoid firing only one axis when we are moving two
          delay(20);
          readInputs();
      }
      sleeping = false;
      lastCommand = millis();
  }
}

void readInputs(){
      
  y = analogRead(PINY);
  y = (512 - y) / 2;

  x = analogRead(PINX); 
  x = (512 - x) / 2;

  if (x > range[0] && x < range[1]){
    x=0;
  }
  if (y > range[0] && y < range[1]){
    y=0;
  }

}
void sendSerial(){
  
  Serial.println("jog:"+String(x)+":"+String(y));
  
  // Serial.println( String("{\"Cmd\": \"Broadcast\", \"Msg\": {\"id\": ")+ String(id) + String(", \"x\": ") + String(x) + String(", \"y\": ")+ String(y) + String("}}"));  
  // Serial.println( String("broadcast {\"id\": ")+ String(id) + String(", \"x\": ") + String(x) + String(", \"y\": ")+ String(y) + String("}"));  
  // Serial.println( String("{\"id\": ")+ String(id) + String(", \"x\": ") + String(x) + String(", \"y\": ")+ String(y) + String("}"));  
  // Serial.println("{x: "+ String(x) + ", y: "+ String(y) + "}");  

}