import RPi.GPIO as GPIO
import time
import httplib

was_pushed = False
loop_interval = 0.05
interval_list = []
loop_count = 0
loop_threshold = 20

GPIO.setmode(GPIO)
GPIO.setup(5, GPIO.IN, pull_up_down=GPIO.PUD_UP)

while True:
	if GPIO.input(5) == False and was_pushed == False:
		print 'Button pressed', loop_count, interval_list
		was_pushed = True

		if loop_count == 0:
			interval_list.append(0)
		else:
			interval_list.append(loop_count)
	elif GPIO.input(5) == True:
		was_pushed = False

	if (len(interval_list) and (loop_count - interval_list[-1]) > loop_threshold) and was_pushed == False:
		request_body = '[' + ','.join([str(elem * loop_interval * 1000) for elem in interval_list]) + ']'
		h1 = httplib.HTTPConnection('192.168.1.14:3000')
		h1.request('PUT', '/api/knock', request_body)

		interval_list = []
		loop_count = 0
		print 'request sent', request_body

	if len(interval_list) > 0:
		loop_count += 1

	time.sleep(loop_interval)
