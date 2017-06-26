##People Counter
##RoomSpace
from picamera.array import PiRGBArray
from picamera import PiCamera
import numpy as np
import cv2
import Person
import time, datetime
import signal,sys
import csv

with open('../doc/data.csv', 'rb') as f:
    reader = csv.reader(f)
writer = csv.writer(open('../doc/data.csv', 'w'))
writer.writerow(["Date", "Time", "enterExit", "Total"])

#Input and Output Counters
cnt_up   = 0
cnt_down = 0
total = 0

#Video Source
w = 160
h = 120
camera = PiCamera()
camera.resolution = (w, h)
camera.framerate = 5
rawCapture = PiRGBArray(camera, size=(w, h))
time.sleep(0.1)

#Prints the capture properties to console
frameArea = h*w
areaTH = frameArea/300 #originally 250
print 'Area Threshold', areaTH

#Input/Output lines
line_up = int(2*(h/5))
line_down   = int(3*(h/5))

up_limit =   int(1*(h/5))
down_limit = int(4*(h/5))

print "Red line y:",str(line_down)
print "Blue line y:", str(line_up)
line_down_color = (255,0,0)
line_up_color = (0,0,255)
pt1 =  [0, line_down];
pt2 =  [w, line_down];
pts_L1 = np.array([pt1,pt2], np.int32)
pts_L1 = pts_L1.reshape((-1,1,2))
pt3 =  [0, line_up];
pt4 =  [w, line_up];
pts_L2 = np.array([pt3,pt4], np.int32)
pts_L2 = pts_L2.reshape((-1,1,2))

pt5 =  [0, up_limit];
pt6 =  [w, up_limit];
pts_L3 = np.array([pt5,pt6], np.int32)
pts_L3 = pts_L3.reshape((-1,1,2))
pt7 =  [0, down_limit];
pt8 =  [w, down_limit];
pts_L4 = np.array([pt7,pt8], np.int32)
pts_L4 = pts_L4.reshape((-1,1,2))

#Background Subtractor (originally True)
fgbg = cv2.createBackgroundSubtractorMOG2(detectShadows = True)

#Structural elements for morphogic filters
kernelOp = np.ones((3,3),np.uint8)
kernelOp2 = np.ones((5,5),np.uint8)
kernelCl = np.ones((11,11),np.uint8)

#Variables
font = cv2.FONT_HERSHEY_SIMPLEX
persons = []
max_p_age = 5
pid = 1

#while(cap.isOpened()):
for image in camera.capture_continuous(rawCapture, format="bgr", use_video_port=True):
    #Read an image of the video source
    #ret, frame = cap.read()
    frame = image.array

    for i in persons:
        i.age_one() #age every person one frame
    #########################
    #    PRE-PROCESSING     #
    #########################

    #Change contrast to eliminate light swell
    cv2.imshow('SourceFrame',frame)
    frame = cv2.cvtColor(frame,cv2.COLOR_RGB2GRAY)
    _ ,frame = cv2.threshold(frame,100,255,cv2.THRESH_BINARY)

    #Apply subtraction of background
    fgmask = fgbg.apply(frame)
    fgmask2 = fgbg.apply(frame)

    #Binarization to remove shadows (gray color)
    try:
        ret,imBin= cv2.threshold(fgmask,200,255,cv2.THRESH_BINARY)
        ret,imBin2 = cv2.threshold(fgmask2,50,120,cv2.THRESH_BINARY)

        cv2.imshow('Bin',imBin)
        cv2.imshow('Bin2',imBin2)

        #Opening (erode->dilate) To remove noise.
        mask = cv2.morphologyEx(imBin, cv2.MORPH_OPEN, kernelOp)
        mask2 = cv2.morphologyEx(imBin2, cv2.MORPH_OPEN, kernelOp)

        #Closing (dilate -> erode) To join white regions.
        mask =  cv2.morphologyEx(mask , cv2.MORPH_CLOSE, kernelCl)
        mask2 = cv2.morphologyEx(mask2, cv2.MORPH_CLOSE, kernelCl)

        #TEST SHOW
        cv2.imshow('Mask',mask)
        cv2.imshow('Mask2',mask2)
        #TEST SHOW


    except:
        print('EOF')
        print 'UP:',cnt_up
        print 'DOWN:',cnt_down
        break
    #################
    #    CONTOURS   #
    #################

    # RETR_EXTERNAL returns only extreme outer flags. All child contours are left behind.
    _, contours0, hierarchy = cv2.findContours(mask2,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours0:
        area = cv2.contourArea(cnt)
        if area > areaTH:
            #################
            #   TRACKING    #
            #################

            #Missing add conditions for multipersons, outputs and screen inputs.

            M = cv2.moments(cnt)
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])
            x,y,w,h = cv2.boundingRect(cnt)

            new = True
            if cy in range(up_limit,down_limit):
                for i in persons:
                    if abs(cx-i.getX()) <= w and abs(cy-i.getY()) <= h:
                        # The object is near one already detected before
                        new = False
                        i.updateCoords(cx,cy)   #Update coordinates in the object and resets age
                        if i.going_UP(line_down,line_up) == True:
                            cnt_up += 1;
                            total -= 1;
                            writer.writerow([time.strftime("%a %x"), time.strftime("%X"), "-1", total])
                            print time.strftime("%a %x %X"),",",total
                        elif i.going_DOWN(line_down,line_up) == True:
                            cnt_down -= 1;
                            total += 1;
                            writer.writerow([time.strftime("%a %x"), time.strftime("%X"), "1", total])
                            print time.strftime("%a %x %X"),",",total
                        break
                    if i.getState() == '1':
                        if i.getDir() == 'down' and i.getY() > down_limit:
                            i.setDone()
                        elif i.getDir() == 'up' and i.getY() < up_limit:
                            i.setDone()
                    if i.timedOut():
                        #Remove from the list persons
                        index = persons.index(i)
                        persons.pop(index)
                        del i     #Free the memory of i
                if new == True:
                    p = Person.MyPerson(pid,cx,cy, max_p_age)
                    persons.append(p)
                    pid += 1
            #################
            #   DRAWINGS    #
            #################
            cv2.circle(frame,(cx,cy), 5, (0,0,255), -1)
            img = cv2.rectangle(frame,(x,y),(x+w,y+h),(0,255,0),2)
            #cv2.drawContours(frame, cnt, -1, (0,255,0), 3)

    #END for cnt in contours0

    #########################
    # DRAWING TRAJECTORIES  #
    #########################
    for i in persons:
##        if len(i.getTracks()) >= 2:
##            pts = np.array(i.getTracks(), np.int32)
##            pts = pts.reshape((-1,1,2))
##            frame = cv2.polylines(frame,[pts],False,i.getRGB())
##        if i.getId() == 9:
##            print str(i.getX()), ',', str(i.getY())
        cv2.putText(frame, str(i.getId()),(i.getX(),i.getY()),font,0.3,i.getRGB(),1,cv2.LINE_AA)

    #################
    #    IMAGES     #
    #################
    str_up = 'UP: '+ str(cnt_up)
    str_down = 'DOWN: '+ str(cnt_down)
    frame = cv2.polylines(frame,[pts_L1],False,line_down_color,thickness=2)
    frame = cv2.polylines(frame,[pts_L2],False,line_up_color,thickness=2)
    frame = cv2.polylines(frame,[pts_L3],False,(255,255,255),thickness=1)
    frame = cv2.polylines(frame,[pts_L4],False,(255,255,255),thickness=1)
    cv2.putText(frame, str_up ,(10,40),font,0.5,(255,255,255),2,cv2.LINE_AA)
    cv2.putText(frame, str_up ,(10,40),font,0.5,(0,0,255),1,cv2.LINE_AA)
    cv2.putText(frame, str_down ,(10,90),font,0.5,(255,255,255),2,cv2.LINE_AA)
    cv2.putText(frame, str_down ,(10,90),font,0.5,(255,0,0),1,cv2.LINE_AA)

    cv2.imshow('Frame',frame)
    #cv2.imshow('Mask',mask)

    #clear the stream in preparation for the next one
    rawCapture.truncate(0)

    #Pre-set ESC to exit
    k = cv2.waitKey(30) & 0xff
    if k == 27:
        break
#END while(cap.isOpened())

#################
#   CLEANING    #
#################
cap.release() # release video file
cv2.destroyAllWindows() # close all openCV windows
