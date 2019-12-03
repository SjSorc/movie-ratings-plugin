package loader;

import java.io.File;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.mongodb.MongoClient;

import reader.MovieReader;

public class App {
	
	public void execute(List<Runnable> readers, List<Runnable> writers, CountDownLatch latch) {
		int poolSize = readers.size() + writers.size();
		ExecutorService executor = Executors.newFixedThreadPool(poolSize);
		
		for(Runnable reader: readers) {
			executor.execute(reader);
		}
		
		for(Runnable writer: writers) {
			executor.execute(writer);
		}
		
		//log time
        long startTime = System.nanoTime();
        
        try {
  		  //wait for the tasks to execute
  		  latch.await();

  		} catch (InterruptedException E) {
  		   // handle
  		}
   
	    long endTime = System.nanoTime();
	    long duration = (endTime - startTime);
	    System.out.println("The process took : " + duration/1000000 + " ms");
	    
	    executor.shutdown();
        
	}
	
	public void processRatings(MongoClient mongo) throws UnknownHostException {
		MovieQueue queue = new MovieQueue();
		CountDownLatch latch = new CountDownLatch(4);
		
        MovieReader r1 = new MovieReader(queue, latch, "RATINGS");
        MovieWriter w1 = new MovieWriter(queue, mongo, latch, "RATINGS");
        MovieWriter w2 = new MovieWriter(queue, mongo, latch, "RATINGS");
        MovieWriter w3 = new MovieWriter(queue, mongo, latch, "RATINGS");
        
        List<Runnable> readers = new ArrayList<>();
        readers.add(r1);
        
        List<Runnable> writers = new ArrayList<>();
        writers.add(w1);
        writers.add(w2);
        writers.add(w3);
        
        execute(readers, writers, latch);
	}
	
	public void processTitles(MongoClient mongo) throws UnknownHostException {
		MovieQueue queue = new MovieQueue();
		CountDownLatch latch = new CountDownLatch(4);
		
        MovieReader r1 = new MovieReader(queue, latch, "TITLES");
        MovieWriter w1 = new MovieWriter(queue, mongo, latch, "TITLES");
        MovieWriter w2 = new MovieWriter(queue, mongo, latch, "TITLES");
        MovieWriter w3 = new MovieWriter(queue, mongo, latch, "TITLES");
        
        List<Runnable> readers = new ArrayList<>();
        readers.add(r1);
        
        List<Runnable> writers = new ArrayList<>();
        writers.add(w1);
        writers.add(w2);
        writers.add(w3);
        
        execute(readers, writers, latch);
	}
	
	public static void main(String[] args) throws IOException {

		MongoClient mongo = new MongoClient("localhost", 27017);
		
		String host = "https://datasets.imdbws.com/";
		String titles = "title.basics.tsv.gz";
		String ratings = "title.ratings.tsv.gz";
		
		Downloader.download(host + titles, "resources/" + titles);
		Downloader.unzip("resources/" + titles, "resources/title.basics.tsv");
		File title = new File("resources/" + titles);
		title.delete();
		
		Downloader.download(host + ratings, "resources/" + ratings);
		Downloader.unzip("resources/" + ratings, "resources/title.ratings.tsv");
		File rat = new File("resources/" + ratings);
		rat.delete();
		
		App app = new App();	
		app.processRatings(mongo);
		app.processTitles(mongo);
		
		mongo.close();
        
	}
}
