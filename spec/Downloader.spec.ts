import 'reflect-metadata';
import { DownloaderImpl } from '../src/implementations/Downloader';

const BucketFile = {
    download: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    })
};
const bucket = {
    file: jest.fn().mockImplementation(() => {
        return BucketFile;
    })
};
const client = {
    bucket: jest.fn().mockImplementation(() => {
        return bucket;
    })
};

test('Downloader', (done) => {
    const downloader = new DownloaderImpl(client);
    downloader.download('bucket', 'remote', 'local')
        .subscribe(() => {
            expect(client.bucket).toHaveBeenCalled();
            expect(bucket.file).toHaveBeenCalled();
            expect(BucketFile.download).toHaveBeenCalled();
            done();
        })
})
