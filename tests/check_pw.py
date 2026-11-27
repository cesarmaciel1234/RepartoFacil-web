import hashlib

stored = '721dbe473faa582a8bb1ed96c50d9107$642e406b0cc2df1cb9fcfda12485f7302003c8a82c85e736f395b65194cc9522'
salt, digest = stored.split('$')
candidates = ['123456', 'password', '1234', 'admin', 'repartidor', 'trencito', 'chofer', 'driver', 'repartofacil', 'secret', 'maciel', 'cesar', '12345678', 'demo1234', 'password123']
for p in candidates:
    d = hashlib.pbkdf2_hmac('sha256', p.encode('utf-8'), salt.encode('utf-8'), 120_000).hex()
    if d == digest:
        print('MATCH FOUND:', p)
        break
else:
    print('No match in candidates')
